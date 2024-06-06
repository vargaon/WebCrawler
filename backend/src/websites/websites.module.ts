import { Module } from '@nestjs/common';
import { WebsitesService } from './websites.service';
import { WebsitesController } from './websites.controller';
import { WebsitesPersistenceModule } from './persistence/persistence.module';
import { ExecutionsModule } from 'src/executions/executions.module';
import { NodesModule } from 'src/nodes/nodes.module';

@Module({
  imports: [WebsitesPersistenceModule, ExecutionsModule, NodesModule],
  controllers: [WebsitesController],
  providers: [WebsitesService],
  exports: [WebsitesService, WebsitesPersistenceModule],
})
export class WebsitesModule {}
