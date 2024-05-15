import { Page } from '../../domain/page';
import { PageSchemaClass } from '../entities/page.schema';

export class PageMapper {
  static toDomain(raw: PageSchemaClass): Page {
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

  static toPersistence(page: Omit<Page, 'id'>): PageSchemaClass {
    const pageEntity = new PageSchemaClass();

    pageEntity.label = page.label;
    pageEntity.url = page.url;
    pageEntity.tags = page.tags;
    pageEntity.regex = page.regex;
    pageEntity.periodicity = {
      value: page.periodicity.value,
      unit: page.periodicity.unit,
    };
    pageEntity.active = page.active;

    return pageEntity;
  }
}
