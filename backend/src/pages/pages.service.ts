import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { PageRepository } from './persistence/repositories/page.repository';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { Page } from './domain/page';
import { EntityCondition } from 'src/utils/types/entity-condition.type';

@Injectable()
export class PagesService {
  constructor(private readonly pagesRepository: PageRepository) {}

  create(createPageDto: CreatePageDto) {
    const clonedPayload = { ...createPageDto };

    //TODO: add validation

    return this.pagesRepository.create(clonedPayload);
  }

  findMany(paginationOptions: IPaginationOptions): Promise<Page[]> {
    return this.pagesRepository.findMany(paginationOptions);
  }

  findOne(fields: EntityCondition<Page>): Promise<Page | null> {
    return this.pagesRepository.findOne(fields);
  }

  update(id: string, body: Partial<Page>): Promise<Page> {
    const clonedPayload = { ...body };

    //TODO: add validation

    const updatedPage = this.pagesRepository.update(id, clonedPayload);

    if (!updatedPage) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          errors: {
            page: 'notFound',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return updatedPage;
  }

  remove(id: string): Promise<void> {
    return this.pagesRepository.softDelete(id);
  }
}
