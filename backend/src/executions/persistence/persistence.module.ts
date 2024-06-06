import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExecutionSchema,
  ExecutionSchemaClass,
} from './entities/execution.schema';
import { ExecutionRepository } from './repositories/execution.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExecutionSchemaClass.name, schema: ExecutionSchema },
    ]),
  ],
  providers: [ExecutionRepository],
  exports: [ExecutionRepository],
})
export class ExecutionsPersistenceModule {}
