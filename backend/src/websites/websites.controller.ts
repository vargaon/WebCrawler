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
import { WebsiteNode } from 'src/nodes/domain/node';

@ApiTags('Website records')
@Controller({ path: 'website-records', version: '1' })
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @ApiCreatedResponse({ type: Website })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPageDto: CreateWebsiteDto) {
    return this.websitesService.create(createPageDto);
  }

  @ApiOkResponse({ type: Website, isArray: true })
  @Get()
  @HttpCode(HttpStatus.OK)
  findMany(@Query() query: QueryWebsiteDto) {
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

  @ApiOkResponse({ type: WebsiteNode, isArray: true })
  @Get(':id/nodes')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async findWebsiteNodes(@Param('id') id: string) {
    const website = await this.websitesService.findById(id);

    if (!website) {
      throw new NotFoundException(`Website with id ${id} not found`);
    }

    return this.websitesService.findWebsiteNodes(website);
  }
}
