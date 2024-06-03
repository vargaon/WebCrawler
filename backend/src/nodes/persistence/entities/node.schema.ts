import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from 'src/utils/document-entity-helper';

export type NodeSchemaDocument = HydratedDocument<NodeSchemaClass>;

@Schema({ collection: 'nodes' })
export class NodeSchemaClass extends EntityDocumentHelper {
  @Prop({ required: false, default: null })
  title?: string | null;

  @Prop({ required: true })
  url: string;

  @Prop({ required: false, default: null })
  crawlTime?: number | null;

  @Prop({ required: true, default: [] })
  children: string[];

  @Prop({ required: true })
  valid: boolean;

  @Prop({ required: true })
  executionId: string;
}

export const NodeSchema = SchemaFactory.createForClass(NodeSchemaClass);

NodeSchema.index({ executionId: 1 });
NodeSchema.index({ url: 1 });
