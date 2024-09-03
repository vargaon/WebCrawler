import { useEffect, useRef, useState } from "preact/compat";
import {
  Alert,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import useBus from "use-bus";
import cytoscape, { Stylesheet } from "cytoscape";
import cytoscapePopper from "cytoscape-popper";
import { createPopper } from "@popperjs/core";
cytoscape.use(cytoscapePopper(createPopper));
// import { mockNodes } from "../services/node-mock-data";
import { NodeDetailsPopover } from "./NodeDetailsPopover";
import { Node, findNodes } from "../services/node";

// interface VisualisationWebsite {
//   id: string;
//   label: string;
//   nodes: Node[];
// }

// // interface CytoscapeWebsiteMetadata {
// //   id: string;
// //   label: string;
// // }

// // interface CytoscapeNodeMetadata {
// //   valid: boolean;
// //   title?: string;
// //   crawlTime?: Date;
// // }

// // interface CytoscapeWebsiteNodeMetadata {
// //   websiteMetadata: CytoscapeWebsiteMetadata;
// //   nodeMetadata: CytoscapeNodeMetadata;
// // }

// // export interface VisualisationNodeData {
// //   nodeType: "website" | "domain";
// //   id: string; // ID is url of the website or domain name of domain node
// //   validCount: number;
// //   lastTitle?: string;
// //   lastCrawlTime?: Date; // Domain that has valid website node counts as crawled and should have valid timestamp
// //   owningWebsiteNodes: CytoscapeWebsiteNodeMetadata[];
// // }

export interface VisualisationNodeData {
  nodeType: "website" | "domain";
  id: string; // ID is url of the website or domain name of domain node
  validCount: number;
  lastTitle?: string;
  lastCrawlTime?: Date; // Domain that has valid website node counts as crawled and should have valid timestamp
  owningCrawlNodes: Node[];
}

function parseDomainNameFromUrlString(urlString: string): string {
  const url = new URL(urlString);
  return url.host;
}

const views = [
  {
    type: "website",
    idMapper: (node: { url: string; }) => node.url,
  },
  {
    type: "domain",
    idMapper: (node: { url: string; }) => parseDomainNameFromUrlString(node.url),
  }
]

const visualisationStyle: Stylesheet[] = [
  {
    selector: "node",
    style: {
      label: "data(id)",
      "text-wrap": "ellipsis",
      "text-max-width": "576px",
      "text-overflow-wrap": "anywhere",
    },
  },
  {
    selector: "node[lastTitle]",
    style: {
      label: "data(lastTitle)",
    }
  },
  {
    selector: "edge",
    style: {
      "curve-style": "straight",
      "target-arrow-shape": "triangle",
    },
  },
  {
    selector: "node[validCount >= 1]",
    style: {
      "background-color": "#6f42c1",
    },
  },
  {
    selector: "node[nodeType='domain']",
    style: {
      display: "none",
      label: "data(id)",
    }
  }
];

export default function Visualisation() {
  const [view, setView] = useState("website");
  const cytoscapeRoot = useRef<HTMLDivElement | null>(null);
  const [detailPopoverTarget, setDetailPopoverTarget] = useState<HTMLElement>();
  const [popoverNodeData, setPopoverNodeData] = useState();
  const [showNodeDetailsPopover, setShowNodeDetailsPopover] = useState(false);
  const cyRef = useRef<cytoscape.Core>();

  const crawlNodesByWebsiteId = useRef<Map<string, Node[]>>(new Map());

  function handleNodeDoubleclick(event: cytoscape.EventObject) {
    if (!event.target.isNode()) return;
    setDetailPopoverTarget(event.target.popperRef());
    setPopoverNodeData(event.target.data());
    setShowNodeDetailsPopover(true);
  }

  // Initial setup of cytoscape component
  useEffect(() => {
    const cytoscapeInstance = cytoscape({
      container: cytoscapeRoot.current,
      autounselectify: true,
      layout: { name: "grid" },
      style: visualisationStyle,
      minZoom: 0.1,
      maxZoom: 10,
    });
    cytoscapeInstance.on("vdblclick", "node", handleNodeDoubleclick);
    //setCy(cytoscapeInstance);
    cyRef.current = cytoscapeInstance;
    // Load hardcoded data
    // loadMockData();

    // React cleanup function
    return () => {
      if (cyRef.current != null) {
        cyRef.current.destroy();
      }
    };
  }, []);

  useBus(
    "selection-add",
    (event) => {
      findNodes(event.websiteId).then(nodes => addWebsiteNodes(event.websiteId, nodes));
    },
    [],
  );
  useBus(
    "selection-remove",
    (event) => {
      console.log("Website id " + event.websiteId + " removed from selection");
    },
    [],
  );

  function switchToDomainView() {
    setView("domain");
    if (cyRef.current != null) {
      cyRef.current.style()
        .selector("node[nodeType='domain']").style("display", "element")
        .selector("node[nodeType='website']").style("display", "none")
        .update();
      cyRef.current.layout({ name: "cose" }).run();
    }
  }

  function switchToWebsiteView() {
    setView("website");
    if (cyRef.current != null) {
      cyRef.current.style(visualisationStyle);
      cyRef.current.layout({ name: "cose" }).run();
    }
  }

  function addWebsiteNodes(websiteId: string, nodes: Node[]) {
    if (cyRef.current == null) {
      return;
    }
    console.log(nodes);
    if (crawlNodesByWebsiteId.current.has(websiteId)) {
      throw new Error("Can't add website with ID " + websiteId + " to visualisation twice, remove it first");
    }
    for (const crawlNode of nodes) {
      if(crawlNode.owner.identifier !== websiteId) {
        throw new Error("Given websiteId does not match node owner id");
      }
    }

    crawlNodesByWebsiteId.current.set(websiteId, nodes);
    cyRef.current.startBatch();
    for (const view of views) {
      for (const crawlNode of nodes) {
        let cytoscapeNode;
        const cytoscapeNodeId = view.idMapper(crawlNode);
        const nodeQuery = cyRef.current.getElementById(cytoscapeNodeId);
        if (nodeQuery.size() == 1) {
          cytoscapeNode = nodeQuery.first();
        }
        else {
          cytoscapeNode = cyRef.current.add({ group: "nodes", data: { id: cytoscapeNodeId, nodeType: view.type, validCount: 0, owningCrawlNodes: [] } });
        }
        const cytoscapeNodeData = cytoscapeNode.data();
        cytoscapeNodeData.owningCrawlNodes.push(crawlNode);

        // Contvert crawlTime string to date only if it is defined
        let crawlTime;
        if (crawlNode.crawlTime != null) {
          crawlTime = new Date(crawlNode.crawlTime);
          cytoscapeNodeData.validCount += 1;
          if (
            cytoscapeNodeData.validCount == 1 || // first time assignment
            cytoscapeNodeData.lastCrawlTime < crawlTime // repeating assignment - lastCrawlTime should be valid
          ) {
            cytoscapeNodeData.lastCrawlTime = crawlTime;
            cytoscapeNodeData.lastTitle = crawlNode.title;
          }
        }
        cytoscapeNode.data(cytoscapeNodeData);
      }

      // We can create edges only after all nodes are added to cytoscape
      for (const crawlNode of nodes) {
        const cytoscapeNodeId = view.idMapper(crawlNode);
        for (const link of crawlNode.links) {
          const linkId = view.idMapper(link);
          // Skip edge to self
          if (cytoscapeNodeId === linkId) {
            continue;
          }
          const edgeId = cytoscapeNodeId.concat("/", linkId);
          let cytoscapeEdge;
          const edgeQuery = cyRef.current.getElementById(edgeId);
          if (edgeQuery.size() == 1) {
            cytoscapeEdge = edgeQuery.first();
          } else {
            cytoscapeEdge = cyRef.current.add({ group: "edges", data: { id: edgeId, source: cytoscapeNodeId, target: linkId, weight: 0 } });
          }
          cytoscapeEdge.data("weight", cytoscapeEdge.data("weight") + 1);
        }
      }
    }
    cyRef.current.endBatch();
    cyRef.current.layout({ name: "cose" }).run();
  }

  return (
    <>
      <ButtonGroup>
        <ToggleButton
          id="vis-view-website"
          type="radio"
          name="visualisation-view"
          value="website"
          variant="outline-warning"
          checked={view === "website"}
          onChange={() => {
            switchToWebsiteView();
          }}
        >
          Website view
        </ToggleButton>
        <ToggleButton
          id="vis-view-domain"
          type="radio"
          name="visualisation-view"
          value="domain"
          variant="outline-warning"
          checked={view === "domain"}
          onChange={switchToDomainView}
        >
          Domain view
        </ToggleButton>
      </ButtonGroup>
      <button className="btn btn-danger" onClick={() => findNodes("ajda")}>TREST</button>
      <div id="cytoscape-container" className="border border-primary">
        <div id="cy" ref={cytoscapeRoot}></div>
      </div>
      <NodeDetailsPopover
        target={detailPopoverTarget!}
        nodeData={popoverNodeData}
        show={showNodeDetailsPopover}
        onClose={() => setShowNodeDetailsPopover(false)}
      />
    </>
  );
}
