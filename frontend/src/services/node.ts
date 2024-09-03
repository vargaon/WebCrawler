import { gql, request } from "graphql-request";
import { GRAPHQL_ENDPOINT_URL } from './config';

export interface NodeOwner {
  identifier: string,
  label: string,
}

export interface Node {
  title?: string,
  url: string,
  crawlTime?: string,
  links: {url: string}[],   // List of URLs
  owner: NodeOwner,
}

/** Fetch all nodes for a single website record */
export async function findNodes(websiteId: string) : Promise<Node[]> {
  const query = gql`{
    nodes(webPages: ["${websiteId}"]) {
      title,
      crawlTime,
      url,
      links {url},
      owner {
        identifier,
        label,
      }
    }
  }`;

  const response = await request<{nodes: unknown}>(GRAPHQL_ENDPOINT_URL, query);
  if(!Array.isArray(response?.nodes)) {
    throw Error("Error fetching nodes");
  }
  const nodes = response.nodes;

  // These steps would be required to connect the nodes
  // const nodeMap = new Map<string, Node>();
  // for(const node of nodes) {
  //   nodeMap.set(node.url, node);
  // }
// for(const node of nodes) {
//   node.valid = node.crawlTime != null;
//   node.links = node.links.map((linkObject: { url: string; }) => nodeMap.get(linkObject.url) ?? {url: linkObject.url, links: [], owner: {id: websiteId}});
// }
  return nodes;
}
