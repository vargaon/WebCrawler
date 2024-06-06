export class CreateNodeDto {
  title?: string | null;
  url: string;
  crawlTime?: number | null;
  children: string[];
  valid: boolean;
  executionId: string;
}
