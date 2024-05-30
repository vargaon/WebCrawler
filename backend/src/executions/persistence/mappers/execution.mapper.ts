import { Execution } from '../../domain/execution';
import { ExecutionStatus } from '../../enum/execution-status.enum';
import { ExecutionSchemaClass } from '../entities/execution.schema';

export class ExecutionMapper {
  static toDomain(raw: ExecutionSchemaClass): Execution {
    return {
      id: raw._id.toString(),
      startTime: raw.startTime,
      endTime: raw.endTime,
      siteCount: raw.siteCount,
      status: ExecutionStatus[raw.status],
      websiteId: raw.websiteId,
    };
  }

  static toPersistence(page: Omit<Execution, 'id'>): ExecutionSchemaClass {
    const executionEntity = new ExecutionSchemaClass();

    executionEntity.startTime = page.startTime;
    executionEntity.endTime = page.endTime;
    executionEntity.siteCount = page.siteCount;
    executionEntity.status = page.status;
    executionEntity.websiteId = page.websiteId;

    return executionEntity;
  }
}
