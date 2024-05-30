import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryNodeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executionId?: string | null;
}
