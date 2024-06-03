import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from 'src/utils/document-entity-helper';
import { ExecutionStatus } from 'src/executions/enum/execution-status.enum';

export type ExecutionSchemaDocument = HydratedDocument<ExecutionSchemaClass>;

@Schema({ collection: 'executions' })
export class ExecutionSchemaClass extends EntityDocumentHelper {
  @Prop({ required: false })
  startTime?: Date | null;

  @Prop({ required: false })
  endTime?: Date | null;

  @Prop({ required: true })
  siteCount: number;

  @Prop({ required: true, type: String, enum: ExecutionStatus })
  status: string;

  @Prop({ required: true })
  websiteId: string;
}

export const ExecutionSchema =
  SchemaFactory.createForClass(ExecutionSchemaClass);

ExecutionSchema.index({ websiteId: 1 });
