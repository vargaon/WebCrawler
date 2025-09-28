import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NodeSchemaClass } from '../entities/node.schema';
import { FilterQuery, Model, isValidObjectId } from 'mongoose';
import { WebsiteNode } from '../../domain/node';
import { NodeMapper } from '../mappers/node.mapper';
import { QueryNodeDto } from 'src/nodes/dto/query-node.dto';

@Injectable()
export class NodeRepository {
  private readonly logger = new Logger(NodeRepository.name);

  constructor(
    @InjectModel(NodeSchemaClass.name)
    private readonly nodesModel: Model<NodeSchemaClass>,
  ) {}

  async createIfNotExist(
    url: string,
    executionId: string,
    valid: boolean,
    parentNodeId?: string,
  ): Promise<WebsiteNode> {
    const where: FilterQuery<NodeSchemaClass> = {
      executionId: executionId,
      url: url,
    };

    const nodeObject = await this.nodesModel.findOneAndUpdate(
      where,
      {
        url: url,
        executionId: executionId,
        valid: valid,
        parentNodeId: parentNodeId,
      },
      {
        upsert: true,
        new: true,
        timestamps: true,
        setDefaultsOnInsert: true,
      },
    );

    return NodeMapper.toDomain(nodeObject);
  }

  async findMany(query: QueryNodeDto): Promise<WebsiteNode[]> {
    const where: FilterQuery<NodeSchemaClass> = {};

    if (query.executionId != null) {
      where.executionId = query.executionId;
    }

    if (query.valid != null) {
      where.valid = query.valid;
    }

    if (query.parentNodeId != null) {
      where.parentNodeId = query.parentNodeId;
    }

    const nodes = await this.nodesModel.find(where);

    return nodes.map((node) => NodeMapper.toDomain(node));
  }

  async findById(id: string): Promise<WebsiteNode | null> {
    if (isValidObjectId(id)) {
      const node = await this.nodesModel.findById(id);
      return node ? NodeMapper.toDomain(node) : null;
    }

    return null;
  }

  async findByUrlAndExecutionId(
    url: string,
    executionId: string,
  ): Promise<WebsiteNode | null> {
    const node = await this.nodesModel.findOne({
      url: url,
      executionId: executionId,
    });

    return node ? NodeMapper.toDomain(node) : null;
  }

  async update(
    id: string,
    payload: Partial<WebsiteNode>,
  ): Promise<WebsiteNode | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id };
    const node = await this.nodesModel.findOne(filter);

    if (!node) {
      return null;
    }

    const nodeObject = await this.nodesModel.findOneAndUpdate(
      filter,
      NodeMapper.toPersistence({
        ...NodeMapper.toDomain(node),
        ...clonedPayload,
      }),
      { new: true },
    );

    return nodeObject ? NodeMapper.toDomain(nodeObject) : null;
  }

  async softDelete(id: string): Promise<void> {
    if (isValidObjectId(id)) {
      await this.nodesModel.deleteOne({ _id: id });
    }
  }
}
