import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, isValidObjectId } from 'mongoose';
import { ExecutionSchemaClass } from '../entities/execution.schema';
import { ExecutionMapper } from '../mappers/execution.mapper';
import { Execution } from '../../domain/execution';
import { QueryExecutionDto } from '../../dto/query-execution.dto';

@Injectable()
export class ExecutionRepository {
  constructor(
    @InjectModel(ExecutionSchemaClass.name)
    private readonly executionsModel: Model<ExecutionSchemaClass>,
  ) {}

  async create(data: Omit<Execution, 'id'>): Promise<Execution> {
    const persistanceModel = ExecutionMapper.toPersistence(data);
    const createdExecution = new this.executionsModel(persistanceModel);
    const executionObject = await createdExecution.save();
    return ExecutionMapper.toDomain(executionObject);
  }

  async findMany(query: QueryExecutionDto): Promise<Execution[]> {
    const where: FilterQuery<ExecutionSchemaClass> = {};

    if (query.websiteId) {
      where.websiteId = query.websiteId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const executions = await this.executionsModel
      .find(where)
      .sort({
        [query.orderBy || '_id']: query.order?.toUpperCase() === 'ASC' ? 1 : -1,
      })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);

    return executions.map((execution) => ExecutionMapper.toDomain(execution));
  }

  async findById(id: string): Promise<Execution | null> {
    if (isValidObjectId(id)) {
      const execution = await this.executionsModel.findById(id);
      return execution ? ExecutionMapper.toDomain(execution) : null;
    }

    return null;
  }

  async update(
    id: string,
    payload: Partial<Execution>,
  ): Promise<Execution | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id };
    const execution = await this.executionsModel.findOne(filter);

    if (!execution) {
      return null;
    }

    const executionObject = await this.executionsModel.findOneAndUpdate(
      filter,
      ExecutionMapper.toPersistence({
        ...ExecutionMapper.toDomain(execution),
        ...clonedPayload,
      }),
      { new: true },
    );

    return executionObject ? ExecutionMapper.toDomain(executionObject) : null;
  }

  async softDelete(id: string): Promise<void> {
    if (isValidObjectId(id)) {
      await this.executionsModel.deleteOne({ _id: id });
    }
  }
}
