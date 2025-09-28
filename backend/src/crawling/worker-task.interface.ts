export interface WorkerTask {
  nodeId: string;
  url: string;
  executionId: string;
  linkRe: RegExp;
}
