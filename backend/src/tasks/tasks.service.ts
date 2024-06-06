import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebsitesService } from 'src/websites/websites.service';
import { ExecutionsService } from 'src/executions/executions.service';
import { getMilliseconds } from 'src/utils/time-calc';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly websitesService: WebsitesService,
    private readonly executionsService: ExecutionsService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    this.websitesService
      .findMany({ limit: 0, active: true })
      .then((websites) => {
        websites.forEach((website) => {
          this.executionsService
            .hasPendingOrRunningExecutions(website.id)
            .then((hasExecutions) => {
              if (!hasExecutions) {
                this.executionsService
                  .findLatestCompletedExecutionByWebsiteId(website.id)
                  .then((latestExecution) => {
                    if (
                      !latestExecution ||
                      (latestExecution.endTime &&
                        latestExecution.endTime.getTime() +
                          getMilliseconds(
                            website.periodicity.unit,
                            website.periodicity.value,
                          ) <=
                          Date.now())
                    ) {
                      this.logger.debug(
                        `Creating execution task for website ${website.id} (${website.label})`,
                      );
                      this.executionsService.createPendingExecutionForWebsite(
                        website.id,
                      );
                    }
                  });
              }
            });
        });
      });
  }
}
