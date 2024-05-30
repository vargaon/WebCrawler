import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebsiteSchemaClass } from '../entities/website.schema';
import { FilterQuery, Model, isValidObjectId } from 'mongoose';
import { Website } from '../../domain/website';
import { WebsiteMapper } from '../mappers/website.mapper';
import { QueryWebsiteDto } from 'src/websites/dto/query-website.dto';

@Injectable()
export class WebsiteRepository {
  constructor(
    @InjectModel(WebsiteSchemaClass.name)
    private readonly websitesModel: Model<WebsiteSchemaClass>,
  ) {}

  async create(data: Omit<Website, 'id'>): Promise<Website> {
    const persistanceModel = WebsiteMapper.toPersistence(data);
    const createdWebsite = new this.websitesModel(persistanceModel);
    const websiteObject = await createdWebsite.save();
    return WebsiteMapper.toDomain(websiteObject);
  }

  async findMany(query: QueryWebsiteDto): Promise<Website[]> {
    const where: FilterQuery<WebsiteSchemaClass> = {};

    if (query.url) {
      where.url = query.url;
    }
    if (query.label) {
      where.label = query.label;
    }
    if (query.tags?.length) {
      where.tags = { $all: query.tags };
    }

    const websites = await this.websitesModel
      .find(where)
      .sort({
        [query.orderBy || '_id']: query.order?.toUpperCase() === 'ASC' ? 1 : -1,
      })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return websites.map((website) => WebsiteMapper.toDomain(website));
  }

  async findById(id: string): Promise<Website | null> {
    if (isValidObjectId(id)) {
      const website = await this.websitesModel.findById(id);
      return website ? WebsiteMapper.toDomain(website) : null;
    }

    return null;
  }

  async update(id: string, payload: Partial<Website>): Promise<Website | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id };
    const website = await this.websitesModel.findOne(filter);

    if (!website) {
      return null;
    }

    const websiteObject = await this.websitesModel.findOneAndUpdate(
      filter,
      WebsiteMapper.toPersistence({
        ...WebsiteMapper.toDomain(website),
        ...clonedPayload,
      }),
      { new: true },
    );

    return websiteObject ? WebsiteMapper.toDomain(websiteObject) : null;
  }

  async softDelete(id: string): Promise<void> {
    if (isValidObjectId(id)) {
      await this.websitesModel.deleteOne({ _id: id });
    }
  }
}
