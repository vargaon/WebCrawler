import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { CrawlingProcessor } from './crawling.processor';
import { WebsitesModule } from 'src/websites/websites.module';
import { ExecutionsModule } from 'src/executions/executions.module';
import { NodesModule } from 'src/nodes/nodes.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'executions',
    }),
    WebsitesModule,
    ExecutionsModule,
    NodesModule,
  ],
  providers: [CrawlingProcessor],
})
export class CrawlingModule {}
