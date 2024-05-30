import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { WebsiteRepository } from './persistence/repositories/website.repository';
import { Website } from './domain/website';
import { QueryWebsiteDto } from './dto/query-website.dto';
import { ExecutionsService } from 'src/executions/executions.service';
import { NodesService } from 'src/nodes/nodes.service';

@Injectable()
export class WebsitesService {
  constructor(
    private readonly websitesRepository: WebsiteRepository,
    private readonly executionsService: ExecutionsService,
    private readonly nodesService: NodesService,
  ) {}

  create(createWebsiteDto: CreateWebsiteDto): Promise<Website> {
    const clonedPayload = { ...createWebsiteDto };

    //TODO: add validation

    return this.websitesRepository.create(clonedPayload);
  }

  findMany(query: QueryWebsiteDto): Promise<Website[]> {
    return this.websitesRepository.findMany(query);
  }

  findById(id: string): Promise<Website | null> {
    return this.websitesRepository.findById(id);
  }

  update(id: string, body: Partial<Website>): Promise<Website> {
    const clonedPayload = { ...body };

    //TODO: add validation

    const updatedWebsite = this.websitesRepository.update(id, clonedPayload);

    if (!updatedWebsite) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          errors: {
            page: 'notFound',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return updatedWebsite;
  }

  remove(id: string) {
    this.websitesRepository.softDelete(id);
    this.executionsService.removeByWebsiteId(id);
  }

  createWebsiteExecution(website: Website) {
    //TODO: send to message queue
    return this.executionsService.createPendingExecutionForWebsite(website.id);
  }

  async findWebsiteNodes(website: Website) {
    const latestCompletedExecution =
      await this.executionsService.findLatestCompletedExecutionByWebsiteId(
        website.id,
      );

    if (!latestCompletedExecution) {
      return [];
    }

    return this.nodesService.findMany({
      executionId: latestCompletedExecution.id,
    });
  }
}
