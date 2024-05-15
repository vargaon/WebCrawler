import { ApiProperty } from '@nestjs/swagger';
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

export class Page {
  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the page',
  })
  id: string;

  @ApiProperty({ example: 'Google', description: 'The label of the page' })
  label: string;

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The URL of the page',
  })
  url: string;

  @ApiProperty({ example: ['School'] })
  tags: string[];

  @ApiProperty({
    example: '.*',
    description: 'The regex to match the page',
  })
  regex: string;

  @ApiProperty({
    type: Periodicity,
    description: 'The periodicity of the page',
  })
  periodicity: Periodicity;

  @ApiProperty({
    example: true,
    description: 'The status of the page',
  })
  active: boolean;
}
