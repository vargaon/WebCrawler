import { Logger } from '@nestjs/common';
import { NodesService } from 'src/nodes/nodes.service';
import { Worker } from 'worker_threads';
import { WorkerTask } from './worker-task.interface';

export class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private busyWorkers: Set<Worker> = new Set();
  private tasks: WorkerTask[] = [];

  constructor(
    private readonly workerScript: string,
    private readonly poolSize: number,
    private readonly executionId: string,
    private readonly nodesServices: NodesService,
    private readonly linkRe: RegExp,
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

  private removeWorker(worker: Worker) {
    this.workers = this.workers.filter((w) => w !== worker);
    this.availableWorkers = this.availableWorkers.filter((w) => w !== worker);
    this.busyWorkers.delete(worker);
  }

  public addTask(task: WorkerTask) {
    if (this.availableWorkers.length > 0) {
      const worker = this.availableWorkers.shift();
      this.busyWorkers.add(worker);
      this.logger.debug(
        `Assigning task to worker ${worker.threadId} (${task.url})`,
      );
      worker.postMessage(task);
    } else {
      this.tasks.push(task);
    }
  }

  public hasPendingTasks(): boolean {
    return this.tasks.length > 0 || this.busyWorkers.size > 0;
  }

  public close() {
    this.workers.forEach((worker) => worker.terminate());
  }

  private onTaskCompleted(worker: Worker, result: any) {
    if (result.type === 'finishedCrawling') {
      this.logger.debug(`Task completed by worker ${worker.threadId}`);
      const nodeId: string = result.nodeId;
      const {
        title,
        links,
        crawlingTime,
      }: { title: string; links: string[]; crawlingTime: number } =
        result.crawlingResult;

      Promise.all(
        links.map(async (link) => {
          return await this.nodesServices.createIfNotExist(
            link,
            this.executionId,
            this.linkRe.test(link),
          );
        }),
      ).then((children) => {
        this.nodesServices
          .update(nodeId, {
            title: title,
            crawlTime: crawlingTime,
            children: children.map((child) => child.id),
          })
          .then(() => {
            children
              .filter((child) => child.valid && child.crawlTime === null)
              .map((child) => ({ nodeId: child.id, url: child.url }))
              .forEach((task) => {
                this.addTask(task);
              });

            if (this.tasks.length > 0) {
              const nextTask = this.tasks.shift();
              this.logger.debug(
                `Assigning task to worker ${worker.threadId} (${nextTask.url})`,
              );
              worker.postMessage(nextTask);
            } else {
              this.availableWorkers.push(worker);
              this.busyWorkers.delete(worker);
            }
          });
      });
    }
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
