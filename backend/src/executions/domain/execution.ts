import { ApiProperty } from '@nestjs/swagger';
import { ExecutionStatus } from '../enum/execution-status.enum';

export class Execution {
  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the execution',
  })
  id: string;

  @ApiProperty({
    example: '2024-05-30T09:02:03.195Z',
    description: 'The start time of the execution',
  })
  startTime?: Date | null;

  @ApiProperty({
    example: '2024-05-30T09:12:03.195Z',
    description: 'The end time of the execution',
  })
  endTime?: Date | null;

  @ApiProperty({
    example: 42,
    description: 'The number of websites crawled',
  })
  siteCount: number;

  @ApiProperty({
    example: 'completed',
    description: 'The status of the execution',
  })
  status: ExecutionStatus;

  @ApiProperty({
    example: '66450c9e9c5b42c1cf041a75',
    description: 'The id of the website',
  })
  websiteId: string;
}
