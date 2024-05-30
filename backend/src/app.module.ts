import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { MongooseConfigService } from './database/config.service';
import { BullConfigService } from './queue/config.service';
import { WebsitesModule } from './websites/websites.module';
import { NodesModule } from './nodes/nodes.module';
import { ExecutionsModule } from './executions/executions.module';
import { TasksModule } from './tasks/tasks.module';
import { BullModule } from '@nestjs/bull';
import { CrawlingModule } from './crawling/crawling.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    BullModule.forRootAsync({
      useClass: BullConfigService,
    }),
    ScheduleModule.forRoot(),
    WebsitesModule,
    NodesModule,
    ExecutionsModule,
    TasksModule,
    CrawlingModule,
  ],
})
export class AppModule {}
