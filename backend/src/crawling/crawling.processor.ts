import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ExecutionsService } from 'src/executions/executions.service';
import { ExecutionStatus } from 'src/executions/enum/execution-status.enum';
import { NodesService } from 'src/nodes/nodes.service';
import { WebsitesService } from 'src/websites/websites.service';
import { WebsiteNode } from 'src/nodes/domain/node';

const axios = require('axios');
const cheerio = require('cheerio');

@Processor('executions')
export class CrawlingProcessor {
  private readonly logger = new Logger(CrawlingProcessor.name);

  constructor(
    private readonly websitesService: WebsitesService,
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
  ) {}

  @Process('execute')
  async handleExecution(job: Job) {
    const execution = await this.executionsService.findById(
      job.data.executionId,
    );

    if (!execution) {
      this.logger.error(`Execution with id ${job.data.executionId} not found`);
      return;
    }

    const website = await this.websitesService.findById(execution.websiteId);

    if (!website) {
      this.logger.error(`Website with id ${execution.websiteId} not found`);
      return;
    }

    this.logger.debug(
      `Start crawling website ${website.id} (${website.label})`,
    );

    //TODO: implement crawling logic

    var siteCount: number = 0;
    const nodesToProcess: WebsiteNode[] = [];
    const linkRe = new RegExp(website.regex);

    const startCrawlingTime = new Date();

    // Update website last crawl time and status
    await this.websitesService.update(website.id, {
      lastCrawlTime: startCrawlingTime,
      lastCrawlStatus: ExecutionStatus.running,
    });

    // Update execution status to running and set start time
    await this.executionsService.update(execution.id, {
      status: ExecutionStatus.running,
      startTime: startCrawlingTime,
    });

    // Create root unprocessed node
    nodesToProcess.push(
      await this.nodesService.createIfNotExist(
        website.url,
        execution.id,
        linkRe.test(website.url),
      ),
    );

    while (nodesToProcess.length > 0) {
      const node = nodesToProcess.pop();

      // Skip already processed or invalid nodes
      if (!node.valid || node.crawlTime !== null) {
        continue;
      }

      try {
        const startNodeCrawlingTime = Date.now();
        const { title, links } = await this.crawlUrl(node.url);
        const nodeCrawlingTime = Date.now() - startNodeCrawlingTime;

        siteCount++;

        const children = await Promise.all(
          links.map(async (link) => {
            return await this.nodesService.createIfNotExist(
              link,
              execution.id,
              linkRe.test(link),
            );
          }),
        );

        node.title = title;
        node.crawlTime = nodeCrawlingTime;
        node.children = children.map((child) => child.id);

        await this.nodesService.update(node.id, node);

        nodesToProcess.push(
          ...children.filter(
            (child) => child.valid && child.crawlTime === null,
          ),
        );
      } catch (error) {
        this.logger.error(`Node crawling error: ${node.url}`);
        this.logger.error(error);

        node.valid = false;
        await this.nodesService.update(node.id, node);
      }
    }

    // Update execution status to completed and set end time
    await this.executionsService.update(execution.id, {
      status: ExecutionStatus.completed,
      endTime: new Date(),
      siteCount: siteCount,
    });

    // Update website last crawl status
    await this.websitesService.update(website.id, {
      lastCrawlStatus: ExecutionStatus.completed,
    });

    this.logger.debug(
      `Finished crawling website ${website.id} (${website.label})`,
    );
  }

  //TODO: multithreading crawling process
  async crawlUrl(url: string) {
    this.logger.debug(`Crawling url: ${url}`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('title').text();
    const links = new Set<string>();

    $('a').each((i, link) => {
      links.add($(link).attr('href'));
    });

    const linksArray = Array.from(links).map((link) => {
      if (this.isRelativeUrl(link)) {
        return url + link.replace(/^\./, '');
      }
      return link;
    });

    return { title, links: linksArray.filter((link) => Boolean(link)) };
  }

  isRelativeUrl(url: string) {
    const pattern = new RegExp('^(/|./)', 'i');
    return pattern.test(url);
  }
}
