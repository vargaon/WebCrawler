import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateNodeDto } from './dto/create-node.dto';
import { NodeRepository } from './persistence/repositories/node.repository';
import { WebsiteNode } from './domain/node';
import { QueryNodeDto } from './dto/query-node.dto';

@Injectable()
export class NodesService {
  constructor(private readonly nodesRepository: NodeRepository) {}

  create(createNodeDto: CreateNodeDto) {
    const clonedPayload = { ...createNodeDto };

    //TODO: add validation

    return this.nodesRepository.create(clonedPayload);
  }

  findMany(query: QueryNodeDto) {
    return this.nodesRepository.findMany(query);
  }

  findById(id: string) {
    return this.nodesRepository.findById(id);
  }

  update(id: string, body: Partial<WebsiteNode>): Promise<WebsiteNode> {
    const clonedPayload = { ...body };

    //TODO: add validation

    const updatedWebsite = this.nodesRepository.update(id, clonedPayload);

    if (!updatedWebsite) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          errors: {
            page: 'notFound',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return updatedWebsite;
  }

  remove(id: string) {
    this.nodesRepository.softDelete(id);
  }

  removeByExecutionId(executionId: string) {
    this.nodesRepository.findMany({ executionId }).then((nodes) => {
      nodes.forEach((node) => {
        this.nodesRepository.softDelete(node.id);
      });
    });
  }

  async addChild(id: string, nodeId: string) {
    const node = await this.nodesRepository.findById(id);

    if (node) {
      if (!node.children.includes(nodeId)) {
        node.children.push(nodeId);
      }
    }

    return this.nodesRepository.update(id, node);
  }
}
