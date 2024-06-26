import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { WebsitesService } from './websites.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { QueryWebsiteDto } from './dto/query-website.dto';
import { Website } from './domain/website';
import { WebsiteExecution } from './domain/website-execution';
import { WebsiteRootNode } from './domain/website-root-node';

@ApiTags('Website records')
@Controller({ path: 'website-records', version: '1' })
export class WebsitesController {
  private readonly logger = new Logger(WebsitesController.name);

  constructor(private readonly websitesService: WebsitesService) {}

  @ApiOkResponse({ type: Website, isArray: true })
  @Get()
  @HttpCode(HttpStatus.OK)
  findMany(@Query() query: QueryWebsiteDto) {
    this.logger.debug(`Querying websites with query: ${JSON.stringify(query)}`);
    return this.websitesService.findMany(query);
  }

  @ApiOkResponse({ type: Website })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  async findById(@Param('id') id: string) {
    const website = await this.websitesService.findById(id);

    if (!website) {
      throw new NotFoundException(`Website with id ${id} not found`);
    }

    return website;
  }

  @ApiCreatedResponse({ type: Website })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPageDto: CreateWebsiteDto) {
    this.logger.debug(
      `Creating website record with data: ${JSON.stringify(createPageDto)}`,
    );
    return this.websitesService.create(createPageDto);
  }

  @ApiOkResponse({ type: Website })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  update(@Param('id') id: string, @Body() updateWebsiteDto: UpdateWebsiteDto) {
    return this.websitesService.update(id, updateWebsiteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.websitesService.remove(id);
  }

  @ApiOkResponse({ type: WebsiteRootNode, isArray: true })
  @Get(':id/root-node')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async findWebsiteRootNode(@Param('id') id: string) {
    const website = await this.websitesService.findById(id);

    if (!website) {
      throw new NotFoundException(`Website with id ${id} not found`);
    }

    const rootNode = await this.websitesService.findWebsiteRootNode(website.id);

    if (!rootNode) {
      throw new NotFoundException(
        `Root node for website with id ${id} not found`,
      );
    }

    const websiteRootNode = new WebsiteRootNode();
    websiteRootNode.nodeId = rootNode.id;

    return websiteRootNode;
  }

  @ApiCreatedResponse({ type: WebsiteExecution })
  @Post(':id/executions')
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async createExecution(@Param('id') id: string) {
    const website = await this.websitesService.findById(id);

    if (!website) {
      throw new NotFoundException(`Website with id ${id} not found`);
    }

    const execution =
      await this.websitesService.createWebsiteExecution(website);

    const websiteExecution = new WebsiteExecution();
    websiteExecution.executionId = execution.id;

    return websiteExecution;
  }
}
