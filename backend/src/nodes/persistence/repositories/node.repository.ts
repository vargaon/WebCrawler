import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { NodeSchemaClass } from '../entities/node.schema';
import { FilterQuery, Model, isValidObjectId } from 'mongoose';
import { WebsiteNode } from '../../domain/node';
import { NodeMapper } from '../mappers/node.mapper';
import { QueryNodeDto } from 'src/nodes/dto/query-node.dto';

@Injectable()
export class NodeRepository {
  constructor(
    @InjectModel(NodeSchemaClass.name)
    private readonly nodesModel: Model<NodeSchemaClass>,
  ) {}

  async create(data: Omit<WebsiteNode, 'id'>): Promise<WebsiteNode> {
    const persistanceModel = NodeMapper.toPersistence(data);
    const createdNode = new this.nodesModel(persistanceModel);
    const nodeObject = await createdNode.save();
    return NodeMapper.toDomain(nodeObject);
  }

  async findMany(query: QueryNodeDto): Promise<WebsiteNode[]> {
    const where: FilterQuery<NodeSchemaClass> = {};

    if (query.executionId) {
      where.executionId = query.executionId;
    }

    if (query.websiteId) {
      where.websiteId = query.websiteId;
    }

    const nodes = await this.nodesModel.find(where).sort({ depth: 1 });

    return nodes.map((node) => NodeMapper.toDomain(node));
  }

  async findById(id: string): Promise<WebsiteNode | null> {
    if (isValidObjectId(id)) {
      const node = await this.nodesModel.findById(id);
      return node ? NodeMapper.toDomain(node) : null;
    }

    return null;
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
