import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EntityDocumentHelper } from 'src/utils/document-entity-helper';
import { TimeUnit } from 'src/common/enum/time-unit.enum';

export type WebsiteSchemaDocument = HydratedDocument<WebsiteSchemaClass>;

@Schema({ _id: false })
export class PeriodicitySchemaClass {
  @Prop({ required: true, default: 1, min: 0 })
  value: number;

  @Prop({ required: true, default: TimeUnit.day })
  unit: TimeUnit;
}

@Schema({ collection: 'website-records' })
export class WebsiteSchemaClass extends EntityDocumentHelper {
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

  @Prop({ default: null })
  lastCrawlTime: Date;

  @Prop({ default: null })
  lastCrawlStatus: string;
}

export const WebsiteSchema = SchemaFactory.createForClass(WebsiteSchemaClass);
