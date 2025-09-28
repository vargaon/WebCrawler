import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class QueryNodeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executionId?: string | null;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? value === 'true' : null))
  @IsOptional()
  @IsBoolean()
  valid?: boolean | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentNodeId?: string | null;
}
