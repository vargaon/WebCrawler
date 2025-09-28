import { Logger } from '@nestjs/common';
import { NodesService } from 'src/nodes/nodes.service';
import { Worker } from 'worker_threads';
import { WorkerTask } from './worker-task.interface';

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private busyWorkers: Set<Worker> = new Set();
  private tasks: Array<WorkerTask> = [];
  private executionNodesToProcess: Map<string, Set<string>> = new Map();
  private crawledUrls: Map<string, Set<string>> = new Map();
  private endOfExecutionCallbacks: Map<
    string,
    (executionId: string) => Promise<void>
  > = new Map();

  constructor(
    private readonly workerScript: string,
    private readonly poolSize: number,
    private readonly nodesServices: NodesService,
    private readonly logger: Logger,
  ) {
    for (let i = 0; i < poolSize; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const worker = new Worker(this.workerScript);

    worker.on('message', (result) => this.onTaskCompleted(worker, result));
    worker.on('exit', (code) => this.onWorkerExit(worker, code));
    worker.on('error', (err) => this.onWorkerError(worker, err));

    this.workers.push(worker);
    this.availableWorkers.push(worker);
  }

  private scheduleTask() {
    if (this.availableWorkers.length > 0 && this.tasks.length > 0) {
      const nextTask = this.tasks.shift();

      const worker = this.availableWorkers.shift();
      this.busyWorkers.add(worker);

      this.logger.debug(
        `Assigning task to worker ${worker.threadId} (${nextTask.url})`,
      );

      worker.postMessage(nextTask);
    }
  }

  private onTaskCompleted(worker: Worker, result: any) {
    if (result.type === 'success') {
      this.logger.debug(
        `Task completed successfully by worker ${worker.threadId}`,
      );

      this.releaseWorker(worker);

      const nodeId: string = result.nodeId;
      const { title, links, crawlingTime, executionId, linkRe } =
        result.crawlingResult;

      // Asynchronní zpracování výsledků
      this.processTaskResult(
        nodeId,
        title,
        crawlingTime,
        links,
        executionId,
        linkRe,
      ).finally(() => {
        this.processTaskEnd(worker, executionId, nodeId);
      });
    } else if (result.type === 'error') {
      this.logger.error(
        `Task to crawl ${result.url} failed by worker ${worker.threadId} (${result.message})`,
      );

      this.releaseWorker(worker);

      this.nodesServices.update(result.nodeId, { valid: false }).finally(() => {
        this.processTaskEnd(worker, result.executionId, result.nodeId);
      });
    }
  }

  private processTaskEnd(worker: Worker, executionId: string, nodeId: string) {
    this.executionNodesToProcess.get(executionId)?.delete(nodeId);
    if (this.executionNodesToProcess.get(executionId)?.size === 0) {
      this.processEndOfExecution(executionId);
    }
  }

  private async processTaskResult(
    nodeId: string,
    title: string,
    crawlingTime: number,
    links: string[],
    executionId: string,
    linkRe: RegExp,
  ) {
    try {
      const children = await Promise.all(
        links.map(async (link) => {
          return await this.nodesServices.createIfNotExist(
            link,
            executionId,
            linkRe.test(link),
            nodeId,
          );
        }),
      );

      await this.nodesServices.update(nodeId, {
        title: title,
        crawlTime: crawlingTime,
        children: children.map((child) => child.id),
      });

      // Přidání nových úkolů do poolu
      children
        .filter(
          (child) =>
            child.valid &&
            child.crawlTime === null &&
            !this.crawledUrls.get(executionId)?.has(child.url),
        )
        .forEach((child) => {
          this.crawledUrls.get(executionId)?.add(child.url);
          this.addTask({
            nodeId: child.id,
            url: child.url,
            executionId: executionId,
            linkRe: linkRe,
          });
        });
    } catch (error) {
      this.logger.error(`Error processing task result: ${error.message}`);
    }
  }

  private removeWorker(worker: Worker) {
    this.workers = this.workers.filter((w) => w !== worker);
    this.availableWorkers = this.availableWorkers.filter((w) => w !== worker);
    this.busyWorkers.delete(worker);
  }

  public addExecutionFirstTask(
    task: WorkerTask,
    endOfExecutionCallback: (executionId: string) => Promise<void>,
  ) {
    this.crawledUrls.set(task.executionId, new Set());
    this.endOfExecutionCallbacks.set(task.executionId, endOfExecutionCallback);
    this.addTask(task);
  }

  public addTask(task: WorkerTask) {
    if (!this.executionNodesToProcess.has(task.executionId)) {
      this.executionNodesToProcess.set(task.executionId, new Set());
    }

    this.executionNodesToProcess.get(task.executionId)?.add(task.nodeId);
    this.tasks.push(task);

    this.scheduleTask();
  }

  private async processEndOfExecution(executionId: string) {
    this.executionNodesToProcess.delete(executionId);
    this.crawledUrls.delete(executionId);

    if (this.endOfExecutionCallbacks.has(executionId)) {
      const callback = this.endOfExecutionCallbacks.get(executionId);
      await callback(executionId);
      this.endOfExecutionCallbacks.delete(executionId);
    }
  }

  private releaseWorker(worker: Worker) {
    this.busyWorkers.delete(worker);
    this.availableWorkers.push(worker);

    this.scheduleTask();
  }

  public hasPendingTasks(): boolean {
    return this.tasks.length > 0 || this.busyWorkers.size > 0;
  }

  public close() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();
    this.tasks = [];
  }

  private onWorkerError(worker: Worker, error: any) {
    this.logger.error(error);

    this.removeWorker(worker);
    this.createWorker();
  }

  private onWorkerExit(worker: Worker, code: number) {
    this.removeWorker(worker);

    if (code !== 0) {
      this.createWorker();
    }
  }
}
