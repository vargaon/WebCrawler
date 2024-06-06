import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TimeUnit } from 'src/common/enum/time-unit.enum';

export class Periodicity {
  @ApiProperty({ example: 1, description: 'The value of the periodicity' })
  value: number;

  @ApiProperty({
    example: 'day',
    description: 'The time unit of the periodicity (minute, hour, day)',
  })
  unit: TimeUnit;
}

export class Website {
  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the page',
  })
  id: string;

  @ApiProperty({ example: 'Google', description: 'The label of the website' })
  label: string;

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The URL of the website',
  })
  url: string;

  @ApiProperty({ example: ['School'] })
  tags: string[];

  @ApiProperty({
    example: '.*',
    description: 'The regex to match the website',
  })
  regex: string;

  @ApiProperty({
    type: Periodicity,
    description: 'The periodicity of the website crawling',
  })
  periodicity: Periodicity;

  @ApiProperty({
    example: true,
    description: 'The status of the website',
  })
  active: boolean;

  @ApiPropertyOptional({
    example: '2021-10-14T15:00:00.000Z',
    description: 'The last time the website was crawled',
  })
  lastCrawlTime?: Date | null;

  @ApiPropertyOptional({
    example: 'completed',
    description: 'The last status of the website crawling',
  })
  lastCrawlStatus?: string | null;
}
