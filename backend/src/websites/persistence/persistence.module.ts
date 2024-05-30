import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebsiteSchema, WebsiteSchemaClass } from './entities/website.schema';
import { WebsiteRepository } from './repositories/website.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebsiteSchemaClass.name, schema: WebsiteSchema },
    ]),
  ],
  providers: [WebsiteRepository],
  exports: [WebsiteRepository],
})
export class WebsitesPersistenceModule {}
