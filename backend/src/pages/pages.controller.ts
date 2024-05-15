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
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Page } from './domain/page';

@ApiTags('Pages')
@Controller({ path: 'pages', version: '1' })
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @ApiCreatedResponse({ type: Page })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @ApiOkResponse({ type: Page, isArray: true })
  @Get()
  @HttpCode(HttpStatus.OK)
  getPages(@Query() paginationDto: PaginationQueryDto) {
    return this.pagesService.findMany(paginationDto);
  }

  @ApiOkResponse({ type: Page })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  getPageById(@Param('id') id: string) {
    const page = this.pagesService.findOne({ id: id });

    if (!page) {
      throw new NotFoundException(`Page with id ${id} not found`);
    }

    return page;
  }

  @ApiOkResponse({ type: Page })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String, required: true })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
