import { WebsiteNode } from '../../domain/node';
import { NodeSchemaClass } from '../entities/node.schema';

export class NodeMapper {
  static toDomain(raw: NodeSchemaClass): WebsiteNode {
    return {
      id: raw._id.toString(),
      title: raw.title,
      url: raw.url,
      crawlTime: raw.crawlTime,
      children: raw.children,
      valid: raw.valid,
      executionId: raw.executionId,
    };
  }

  static toPersistence(node: Omit<WebsiteNode, 'id'>): NodeSchemaClass {
    const nodeEntity = new NodeSchemaClass();

    nodeEntity.title = node.title;
    nodeEntity.url = node.url;
    nodeEntity.crawlTime = node.crawlTime;
    nodeEntity.children = node.children;
    nodeEntity.valid = node.valid;
    nodeEntity.executionId = node.executionId;

    return nodeEntity;
  }
}
