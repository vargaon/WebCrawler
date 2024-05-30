import { Module } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { ExecutionsPersistenceModule } from './persistence/persistence.module';
import { BullModule } from '@nestjs/bull';
import { NodesModule } from 'src/nodes/nodes.module';

@Module({
  imports: [
    ExecutionsPersistenceModule,
    BullModule.registerQueue({
      name: 'executions',
    }),
    NodesModule,
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
  exports: [ExecutionsService, ExecutionsPersistenceModule],
})
export class ExecutionsModule {}
