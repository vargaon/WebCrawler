import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ExecutionsService } from 'src/executions/executions.service';
import { ExecutionStatus } from 'src/executions/enum/execution-status.enum';
import { NodesService } from 'src/nodes/nodes.service';
import { WebsitesService } from 'src/websites/websites.service';

@Processor('executions')
export class CrawlingProcessor {
  private readonly logger = new Logger(CrawlingProcessor.name);

  constructor(
    private readonly websitesService: WebsitesService,
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
  ) {}

  @Process('execute')
  async handleTranscode(job: Job) {
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

    this.logger.debug(`Start crawling website ${website.id} (${website.url})`);

    //TODO: implement crawling logic

    const startNodeCrawlingTime = Date.now();

    const nodeCrawlingTime = Date.now() - startNodeCrawlingTime;

    const node = await this.nodesService.create({
      title: website.label,
      url: website.url,
      crawlTime: nodeCrawlingTime,
      children: [],
      depth: 0,
      valid: true,
      executionId: execution.id,
    });

    await this.executionsService.update(job.data.executionId, {
      status: ExecutionStatus.completed,
      startTime: new Date(),
      endTime: new Date(),
    });
  }
}
