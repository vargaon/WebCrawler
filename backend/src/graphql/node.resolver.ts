import {
  Resolver,
  Query,
  Args,
  ResolveField,
  ID,
  Parent,
} from '@nestjs/graphql';
import { Node } from './models/node.model';
import { WebPage } from './models/webpage.model';
import { WebsitesService } from 'src/websites/websites.service';
import { WebsiteNode } from 'src/nodes/domain/node';
import { NodesService } from 'src/nodes/nodes.service';

@Resolver((of) => Node)
export class NodeResolver {
  constructor(
    private readonly websitesServices: WebsitesService,
    private readonly nodesServices: NodesService,
  ) {}

  @Query((returns) => [Node])
  async nodes(
    @Args({ name: 'webPages', type: () => [ID] }) webPages: string[],
  ) {
    const rootNodes = await Promise.all(
      webPages.map(async (webPageId) => {
        return await this.websitesServices.findWebsiteRootNode(webPageId);
      }),
    );

    const rootNodesMap = new Map<string, WebsiteNode>();
    rootNodes.forEach((node, index) => {
      if (node) {
        rootNodesMap.set(webPages[index], node);
      }
    });

    const result = [];

    rootNodesMap.forEach((node, key) =>
      result.push({
        title: node.title,
        url: node.url,
        crawlTime: node.crawlTime,
        links: node.children,
        linksIds: node.children,
        owner: key,
        ownerId: key,
      }),
    );

    return result;
  }

  @ResolveField('links', (of) => [Node])
  async getLinks(@Parent() node: Node) {
    const children = await Promise.all(
      node.linksIds.map(async (linkId) => {
        return await this.nodesServices.findById(linkId);
      }),
    );

    return children.map((child) => ({
      title: child.title,
      url: child.url,
      crawlTime: child.crawlTime,
      links: child.children,
      linksIds: child.children,
      owner: node.ownerId,
      ownerId: node.ownerId,
    }));
  }

  @ResolveField('owner', (of) => WebPage)
  async getOwner(@Parent() node: Node): Promise<WebPage> {
    const website = await this.websitesServices.findById(node.ownerId);

    if (!website) {
      throw new Error(`Website with id ${node.ownerId} not found`);
    }

    return {
      identifier: website.id,
      label: website.label,
      url: website.url,
      regex: website.regex,
      tags: website.tags,
      active: website.active,
    };
  }
}
