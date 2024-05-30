import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesPersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [NodesPersistenceModule],
  providers: [NodesService],
  exports: [NodesService, NodesPersistenceModule],
})
export class NodesModule {}
