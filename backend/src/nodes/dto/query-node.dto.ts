import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class QueryNodeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  executionId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  valid?: boolean | null;
}
