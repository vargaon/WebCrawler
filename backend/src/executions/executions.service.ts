import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { ExecutionRepository } from './persistence/repositories/execution.repository';
import { QueryExecutionDto } from './dto/query-execution.dto';
import { Execution } from './domain/execution';
import { ExecutionStatus } from './enum/execution-status.enum';

@Injectable()
export class ExecutionsService {
  constructor(private readonly executionsRepository: ExecutionRepository) {}

  create(createExecutionDto: CreateExecutionDto) {
    const clonedPayload = { ...createExecutionDto };

    return this.executionsRepository.create(clonedPayload);
  }

  findMany(query: QueryExecutionDto) {
    return this.executionsRepository.findMany(query);
  }

  findById(id: string): Promise<Execution | null> {
    return this.executionsRepository.findById(id);
  }

  update(id: string, body: Partial<Execution>) {
    const clonedPayload = { ...body };

    const updatedExecution = this.executionsRepository.update(
      id,
      clonedPayload,
    );

    if (!updatedExecution) {
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

    return updatedExecution;
  }

  remove(id: string) {
    return this.executionsRepository.softDelete(id);
  }

  createPendingExecutionForWebsite(websiteId: string) {
    return this.create({
      startTime: null,
      endTime: null,
      siteCount: 0,
      status: ExecutionStatus.pending,
      websiteId: websiteId,
    });
  }

  removeByWebsiteId(websiteId: string) {
    this.executionsRepository.findMany({ websiteId }).then((executions) => {
      executions.forEach((execution) => {
        this.executionsRepository.softDelete(execution.id);
      });
    });
  }

  async findLatestCompletedExecutionByWebsiteId(
    websiteId: string,
  ): Promise<Execution | null> {
    const executions = await this.executionsRepository.findMany({
      websiteId,
      status: ExecutionStatus.completed,
      limit: 1,
      orderBy: 'endTime',
      order: 'DESC',
    });

    if (!executions.length) {
      return null;
    }

    return executions[0];
  }

  async hasPendingOrRunningExecutions(websiteId: string): Promise<boolean> {
    const pendingExecutions = await this.executionsRepository.findMany({
      websiteId,
      status: ExecutionStatus.pending,
    });

    if (pendingExecutions.length > 0) {
      return true;
    }

    const runningExecutions = await this.executionsRepository.findMany({
      websiteId,
      status: ExecutionStatus.running,
    });

    return runningExecutions.length > 0;
  }
}
