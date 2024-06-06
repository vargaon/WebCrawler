import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NodeSchema, NodeSchemaClass } from './entities/node.schema';
import { NodeRepository } from './repositories/node.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NodeSchemaClass.name, schema: NodeSchema },
    ]),
  ],
  providers: [NodeRepository],
  exports: [NodeRepository],
})
export class NodesPersistenceModule {}
