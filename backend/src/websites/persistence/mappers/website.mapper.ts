import { Website } from '../../domain/website';
import { WebsiteSchemaClass } from '../entities/website.schema';

export class WebsiteMapper {
  static toDomain(raw: WebsiteSchemaClass): Website {
    return {
      id: raw._id.toString(),
      label: raw.label,
      url: raw.url,
      tags: raw.tags,
      regex: raw.regex,
      periodicity: {
        value: raw.periodicity.value,
        unit: raw.periodicity.unit,
      },
      active: raw.active,
    };
  }

  static toPersistence(website: Omit<Website, 'id'>): WebsiteSchemaClass {
    const websiteEntity = new WebsiteSchemaClass();

    websiteEntity.label = website.label;
    websiteEntity.url = website.url;
    websiteEntity.tags = website.tags;
    websiteEntity.regex = website.regex;
    websiteEntity.periodicity = {
      value: website.periodicity.value,
      unit: website.periodicity.unit,
    };
    websiteEntity.active = website.active;

    return websiteEntity;
  }
}
