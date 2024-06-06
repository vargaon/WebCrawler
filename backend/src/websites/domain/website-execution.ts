import { ApiProperty } from '@nestjs/swagger';

export class WebsiteExecution {
  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the website execution',
  })
  executionId: string;
}
