import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryWebsiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  label?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderBy?: string | null;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? value : 'ASC'))
  @IsString()
  @IsOptional()
  order?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
