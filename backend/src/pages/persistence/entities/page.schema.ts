import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from 'src/utils/document-entity-helper';
import { TimeUnit } from 'src/common/enum/time-unit.enum';

export type PageSchemaDocument = HydratedDocument<PageSchemaClass>;

@Schema({ _id: false })
export class PeriodicitySchemaClass {
  @Prop({ required: true, default: 1, min: 0 })
  value: number;

  @Prop({ required: true, default: TimeUnit.day })
  unit: TimeUnit;
}

@Schema({ collection: 'pages' })
export class PageSchemaClass extends EntityDocumentHelper {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  tags: string[];

  @Prop({ required: true })
  regex: string;

  @Prop({ type: PeriodicitySchemaClass, required: true })
  periodicity: PeriodicitySchemaClass;

  @Prop({ default: true })
  active: boolean;
}

export const PageSchema = SchemaFactory.createForClass(PageSchemaClass);
