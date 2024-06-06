import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { NodesService } from './nodes.service';
import { WebsiteNode } from './domain/node';

@ApiTags('Nodes')
@Controller({ path: 'nodes', version: '1' })
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

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
