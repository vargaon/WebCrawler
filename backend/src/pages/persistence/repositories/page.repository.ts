import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PageSchemaClass } from '../entities/page.schema';
import { Model } from 'mongoose';
import { Page } from '../../domain/page';
import { PageMapper } from '../mappers/page.mapper';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { EntityCondition } from 'src/utils/types/entity-condition.type';

@Injectable()
export class PageRepository {
  constructor(
    @InjectModel(PageSchemaClass.name)
    private readonly pagesModel: Model<PageSchemaClass>,
  ) {}

  async create(data: Omit<Page, 'id'>): Promise<Page> {
    const persistanceModel = PageMapper.toPersistence(data);
    const createdPage = new this.pagesModel(persistanceModel);
    const userObject = await createdPage.save();
    return PageMapper.toDomain(userObject);
  }

  async findMany(paginationOptions: IPaginationOptions): Promise<Page[]> {
    const pages = await this.pagesModel
      .find()
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    return pages.map((page) => PageMapper.toDomain(page));
  }

  async findOne(fields: EntityCondition<Page>): Promise<Page | null> {
    if (fields.id) {
      const page = await this.pagesModel.findById(fields.id);
      return page ? PageMapper.toDomain(page) : null;
    }

    const page = await this.pagesModel.findOne(fields);
    return page ? PageMapper.toDomain(page) : null;
  }

  async update(id: string, payload: Partial<Page>): Promise<Page | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id };
    const page = await this.pagesModel.findOne(filter);

    if (!page) {
      return null;
    }

    const pageObject = await this.pagesModel.findOneAndUpdate(
      filter,
      PageMapper.toPersistence({
        ...PageMapper.toDomain(page),
        ...clonedPayload,
      }),
      { new: true },
    );

    return pageObject ? PageMapper.toDomain(pageObject) : null;
  }

  async softDelete(id: string): Promise<void> {
    await this.pagesModel.deleteOne({ _id: id });
  }
}
