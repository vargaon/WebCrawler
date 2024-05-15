import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PagesPersistenceModule } from './persistence/persistence.module';

@Module({
  imports: [PagesPersistenceModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService, PagesPersistenceModule],
})
export class PagesModule {}
