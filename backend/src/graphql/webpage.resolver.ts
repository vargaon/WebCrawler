import { Resolver, Query } from '@nestjs/graphql';
import { WebPage } from './models/webpage.model';
import { WebsitesService } from 'src/websites/websites.service';

@Resolver((of) => WebPage)
export class WebPageResolver {
  constructor(private readonly websitesServices: WebsitesService) {}

  @Query((returns) => [WebPage])
  async websites(): Promise<WebPage[]> {
    const websites = this.websitesServices.findMany({ limit: 0 });

    return (await websites).map((website) => ({
      identifier: website.id,
      label: website.label,
      url: website.url,
      regex: website.regex,
      tags: website.tags,
      active: website.active,
    }));
  }
}
