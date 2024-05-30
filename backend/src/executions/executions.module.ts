import { Module } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { ExecutionsPersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [ExecutionsPersistenceModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
  exports: [ExecutionsService, ExecutionsPersistenceModule],
})
export class ExecutionsModule {}
