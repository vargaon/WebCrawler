import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ExecutionsService } from 'src/executions/executions.service';
import { ExecutionStatus } from 'src/executions/enum/execution-status.enum';
import { NodesService } from 'src/nodes/nodes.service';
import { WebsitesService } from 'src/websites/websites.service';
import { WorkerPool } from './worker-pool';
import { WorkerTask } from './worker-task.interface';
import { ConfigService } from '@nestjs/config';

@Processor('executions')
export class CrawlingProcessor {
  private readonly logger = new Logger(CrawlingProcessor.name);

  constructor(
    private readonly websitesService: WebsitesService,
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
    private readonly configService: ConfigService,
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

    const workerPool = new WorkerPool(
      './dist/crawling/worker-script.js',
      this.configService.get<number>('crawling.poolSize'),
      execution.id,
      this.nodesService,
      linkRe,
      this.logger,
    );

    const rootNode = await this.nodesService.createIfNotExist(
      website.url,
      execution.id,
      linkRe.test(website.url),
    );

    if (rootNode.valid) {
      const firstTask: WorkerTask = {
        url: rootNode.url,
        nodeId: rootNode.id,
      };

      workerPool.addTask(firstTask);

      while (workerPool.hasPendingTasks()) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const crawledNodes = await this.nodesService.findMany({
      executionId: execution.id,
      valid: true,
    });

    // Update execution status to completed and set end time
    await this.executionsService.update(execution.id, {
      status: ExecutionStatus.completed,
      endTime: new Date(),
      siteCount: crawledNodes.length,
    });

    // Update website last crawl status
    await this.websitesService.update(website.id, {
      lastCrawlStatus: ExecutionStatus.completed,
    });

    this.logger.debug(
      `Finished crawling website ${website.id} (${website.label})`,
    );
  }
}
