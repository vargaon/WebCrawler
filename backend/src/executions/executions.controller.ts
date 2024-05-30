import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { ExecutionsService } from './executions.service';
import { Execution } from './domain/execution';
import { QueryExecutionDto } from './dto/query-execution.dto';

@ApiTags('Executions')
@Controller({ path: 'executions', version: '1' })
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @ApiOkResponse({ type: Execution, isArray: true })
  @Get()
  findMany(@Query() query: QueryExecutionDto) {
    return this.executionsService.findMany(query);
  }

  @ApiOkResponse({ type: Execution })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  async findById(@Param('id') id: string) {
    const execution = await this.executionsService.findById(id);

    if (!execution) {
      throw new NotFoundException(`Execution with id ${id} not found`);
    }

    return execution;
  }
}
