import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { WebsitesModule } from 'src/websites/websites.module';
import { ExecutionsModule } from 'src/executions/executions.module';

@Module({
  imports: [WebsitesModule, ExecutionsModule],
  providers: [TasksService],
})
export class TasksModule {}
