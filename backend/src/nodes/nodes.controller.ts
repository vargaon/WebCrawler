import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { NodesService } from './nodes.service';
import { WebsiteNode } from './domain/node';
import { QueryNodeDto } from './dto/query-node.dto';

@ApiTags('Nodes')
@Controller({ path: 'nodes', version: '1' })
export class NodesController {
  private readonly logger = new Logger(NodesController.name);

  constructor(private readonly nodesService: NodesService) {}

  @ApiOkResponse({ type: WebsiteNode, isArray: true })
  @Get()
  @HttpCode(HttpStatus.OK)
  findMany(@Query() query: QueryNodeDto) {
    this.logger.debug(`Querying nodes with query: ${JSON.stringify(query)}`);
    return this.nodesService.findMany(query);
  }

  @ApiOkResponse({ type: WebsiteNode })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  async findById(@Param('id') id: string) {
    const node = await this.nodesService.findById(id);

    if (!node) {
      throw new NotFoundException(`Node with id ${id} not found`);
    }

    return node;
  }
}
