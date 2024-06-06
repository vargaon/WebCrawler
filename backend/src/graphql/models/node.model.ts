import { Field, ObjectType } from '@nestjs/graphql';
import { WebPage } from './webpage.model';

@ObjectType()
export class Node {
  @Field({ nullable: true })
  title?: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  crawlTime?: string;

  @Field((type) => [Node])
  links: Node[];

  linksIds: string[];

  @Field((type) => WebPage)
  owner: WebPage;

  ownerId: string;
}
