import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryNodeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executionId?: string | null;
}
