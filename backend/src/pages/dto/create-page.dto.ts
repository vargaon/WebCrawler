import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, Length, IsUrl, IsEnum } from 'class-validator';
import { TimeUnit } from 'src/common/enum/time-unit.enum';

export class PeriodicityDto {
  @ApiProperty({ example: 1, description: 'The value of the periodicity' })
  value: number;

  @ApiProperty({
    example: 'day',
    description: 'The time unit of the periodicity (minute, hour, day)',
  })
  @IsEnum(TimeUnit)
  unit: TimeUnit;
}

export class CreatePageDto {
  @ApiProperty({ example: 'Google', description: 'The label of the page' })
  @Length(1, 100)
  label: string;

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The URL of the page',
  })
  @IsUrl()
  url: string;

  @ApiProperty({ example: ['School'] })
  @ArrayMaxSize(10)
  @Length(1, 25, { each: true })
  tags: string[];

  @ApiProperty({
    example: '.*',
    description: 'The regex to match the page',
  })
  @Length(1, 100)
  regex: string;

  @ApiProperty({
    type: PeriodicityDto,
    description: 'The periodicity of the page',
  })
  @Type(() => PeriodicityDto)
  periodicity: PeriodicityDto;

  @ApiProperty({
    example: true,
    description: 'The status of the page',
  })
  active: boolean;
}
