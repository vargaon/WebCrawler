import { ExecutionStatus } from '../enum/execution-status.enum';

export class CreateExecutionDto {
  startTime: Date;
  endTime: Date;
  siteCount: number;
  websiteId: string;
  status: ExecutionStatus;
}
