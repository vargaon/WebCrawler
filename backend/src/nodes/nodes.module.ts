import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesPersistenceModule } from './persistence/persistence.module';
import { NodesController } from './nodes.controller';

@Module({
  imports: [NodesPersistenceModule],
  providers: [NodesService],
  controllers: [NodesController],
  exports: [NodesService, NodesPersistenceModule],
})
export class NodesModule {}
