export class CreateNodeDto {
  title?: string | null;
  url: string;
  crawlTime?: number | null;
  children: string[];
  depth: number;
  valid: boolean;
  websiteId: string;
  executionId: string;
}
