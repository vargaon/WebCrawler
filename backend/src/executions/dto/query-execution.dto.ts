import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ExecutionStatus } from '../enum/execution-status.enum';

export class QueryExecutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  websiteId?: string | null;

  @ApiPropertyOptional({ enum: ExecutionStatus })
  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus | null;

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
