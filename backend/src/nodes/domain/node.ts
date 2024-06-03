import { ApiProperty } from '@nestjs/swagger';

export class WebsiteNode {
  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the node',
  })
  id: string;

  @ApiProperty({
    example: 'Google',
    description: 'The title of the node',
  })
  title?: string | null;

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The url of the node',
  })
  url: string;

  @ApiProperty({
    example: 42,
    description: 'The time it took to crawl the node in seconds',
  })
  crawlTime?: number | null;

  @ApiProperty({
    example: ['66450c9e9c5b42c1cf041a75'],
    description: 'The children of the node',
  })
  children: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the node is valid',
  })
  valid: boolean;

  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the execution',
  })
  executionId: string;
}
