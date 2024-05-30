import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { MongooseConfigService } from './database/config.service';
import { WebsitesModule } from './websites/websites.module';
import { NodesModule } from './nodes/nodes.module';
import { ExecutionsModule } from './executions/executions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    ScheduleModule.forRoot(),
    WebsitesModule,
    NodesModule,
    ExecutionsModule,
  ],
  providers: [],
})
export class AppModule {}
