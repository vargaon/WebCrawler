import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PageSchema, PageSchemaClass } from './entities/page.schema';
import { PageRepository } from './repositories/page.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PageSchemaClass.name, schema: PageSchema },
    ]),
  ],
  providers: [PageRepository],
  exports: [PageRepository],
})
export class PagesPersistenceModule {}
