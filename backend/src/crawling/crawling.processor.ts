import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ExecutionsService } from 'src/executions/executions.service';
import { ExecutionStatus } from 'src/executions/enum/execution-status.enum';
import { NodesService } from 'src/nodes/nodes.service';
import { WebsitesService } from 'src/websites/websites.service';
import { WorkerPool } from './worker-pool';
import { ConfigService } from '@nestjs/config';

@Processor('executions')
export class CrawlingProcessor {
  private readonly logger = new Logger(CrawlingProcessor.name);
  private workerPool: WorkerPool;

  constructor(
    private readonly websitesService: WebsitesService,
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
    private readonly configService: ConfigService,
  ) {
    this.workerPool = new WorkerPool(
      './dist/crawling/worker-script.js',
      this.configService.get<number>('crawling.poolSize'),
      this.nodesService,
      this.logger,
    );
  }

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

    const rootNode = await this.nodesService.createIfNotExist(
      website.url,
      execution.id,
      linkRe.test(website.url),
    );

    if (rootNode.valid) {
      this.workerPool.addExecutionFirstTask(
        {
          url: rootNode.url,
          nodeId: rootNode.id,
          executionId: execution.id,
          linkRe: linkRe,
        },
        this.processEndOfExecution.bind(this),
      );
    }
  }

  private async processEndOfExecution(executionId: string) {
    const crawledNodes = await this.nodesService.findMany({
      executionId: executionId,
      valid: true,
    });

    // Update execution status to completed and set end time
    await this.executionsService.update(executionId, {
      status: ExecutionStatus.completed,
      endTime: new Date(),
      siteCount: crawledNodes.length,
    });

    // Update website last crawl status
    const execution = await this.executionsService.findById(executionId);
    if (execution) {
      await this.websitesService.update(execution.websiteId, {
        lastCrawlStatus: ExecutionStatus.completed,
      });
    }

    this.logger.debug(
      `Finished crawling website ${execution?.websiteId} (${execution?.id})`,
    );
  }
}
