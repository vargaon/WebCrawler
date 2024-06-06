import { ID, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WebPage {
  @Field(() => ID)
  identifier: string;

  @Field()
  label: string;

  @Field()
  url: string;

  @Field()
  regex: string;

  @Field((type) => [String])
  tags: string[];

  @Field()
  active: boolean;
}
