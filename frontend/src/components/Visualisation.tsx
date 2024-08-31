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
import { Node, mockNodes } from "../services/node-mock-data";
import { NodeDetailsPopover } from "./NodeDetailsPopover";

interface VisualisationWebsite {
  id: string;
  label: string;
  nodes: Node[];
}

interface CytoscapeWebsiteMetadata {
  id: string;
  label: string;
}

interface CytoscapeNodeMetadata {
  valid: boolean;
  title?: string;
  crawlTime?: Date;
}

interface CytoscapeWebsiteNodeMetadata {
  websiteMetadata: CytoscapeWebsiteMetadata;
  nodeMetadata: CytoscapeNodeMetadata;
}

export interface VisualisationNodeData {
  nodeType: "website" | "domain";
  id: string; // ID is url of the website
  validCount: number;
  lastTitle?: string;
  lastCrawlTime?: Date; // Domain that has valid website node counts as crawled and should have valid timestamp
  owningWebsiteNodes: CytoscapeWebsiteNodeMetadata[];
}

function parseDomainNameFromUrlString(urlString: string): string {
  const url = new URL(urlString);
  return url.host;
}

const visualisationStyle : Stylesheet[] = [
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
      label:"data(lastTitle)",
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
];
export default function Visualisation() {
  //const [mode, setMode] = useState("static");
  const [view, setView] = useState("website");
  const cytoscapeRoot = useRef<HTMLDivElement | null>(null);
  const websitesByID = useRef<Map<string, VisualisationWebsite>>(new Map());
  const [detailPopoverTarget, setDetailPopoverTarget] = useState<HTMLElement>();
  const [popoverNodeData, setPopoverNodeData] = useState();
  const [showNodeDetailsPopover, setShowNodeDetailsPopover] = useState(false);
  const [cy, setCy] = useState<cytoscape.Core>();

  function handleNodeDoubleclick(event: cytoscape.EventObject) {
    if (!event.target.isNode()) return;
    setDetailPopoverTarget(event.target.popperRef());
    setPopoverNodeData(event.target.data());
    setShowNodeDetailsPopover(true);
  }

  function loadMockData() {
    const nodes = mockNodes;
    const websiteMap = websitesByID.current;
    for (const node of nodes) {
      const owner = node.owner;
      let visualisationWebsite = websiteMap.get(owner.id!);
      if (!visualisationWebsite) {
        visualisationWebsite = { id: owner.id!, label: owner.label, nodes: [] };
        websiteMap.set(owner.id!, visualisationWebsite);
      }
      visualisationWebsite.nodes.push(node);
    }
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
    setCy(cytoscapeInstance);
    // Load hardcoded data
    loadMockData();

    // React cleanup function
    return () => {
      if (cy != null) {
        cy.destroy();
      }
    };
  }, []);

  // First render
  useEffect(() => {
    if (view == "website") {
      switchToWebsiteView();
    } else {
      switchToDomainView();
    }
  }, [cy]);

  function switchToDomainView() {
    if (cy == null) {
      return;
    }
    cy.elements().remove();

    const cytoscapeNodesByDomain = new Map();
    const cytoscapeEdgesById = new Map();

    for (const website of websitesByID.current.values()) {
      const websiteMetadata: CytoscapeWebsiteMetadata = {
        id: website.id,
        label: website.label,
      };
      for (const crawlNode of website.nodes) {
        const crawlNodeDomain = parseDomainNameFromUrlString(crawlNode.url);
        let cytoscapeNode: cytoscape.ElementDefinition = cytoscapeNodesByDomain.get(crawlNodeDomain);
        if (cytoscapeNode == null) {
          cytoscapeNode = { data: { id: crawlNodeDomain, nodeType: "domain", owningWebsiteNodes: [], validCount: 0 } };
          cytoscapeNodesByDomain.set(crawlNodeDomain, cytoscapeNode);
        }

        // Contvert crawlTime string to date only if it is defined
        let crawlTime;
        if (crawlNode.crawlTime != null) {
          crawlTime = new Date(crawlNode.crawlTime);
        }

        if (crawlNode.valid && crawlTime) {
          cytoscapeNode.data.validCount += 1;
          if (
            cytoscapeNode.data.validCount == 1 || // first time assignment
            cytoscapeNode.data.lastCrawlTime < crawlTime // repeating assignment - lastCrawlTime should be valid
          ) {
            cytoscapeNode.data.lastCrawlTime = crawlTime;
          }
        }

        let websiteNodeMetadata: CytoscapeWebsiteNodeMetadata;
        if (
          !(websiteNodeMetadata = cytoscapeNode.data.owningWebsiteNodes.find(
            (owningWebsiteNode: CytoscapeWebsiteNodeMetadata) => owningWebsiteNode.websiteMetadata.id === website.id,
          ))
        ) {
          websiteNodeMetadata = {
            websiteMetadata,
            nodeMetadata: {
              valid: false,
            },
          };
          cytoscapeNode.data.owningWebsiteNodes.push(websiteNodeMetadata);
        }
        websiteNodeMetadata.nodeMetadata.valid = websiteNodeMetadata.nodeMetadata.valid || crawlNode.valid;
        if (crawlTime) {
          websiteNodeMetadata.nodeMetadata.crawlTime ??= crawlTime;
          if (websiteNodeMetadata.nodeMetadata.crawlTime < crawlTime) {
            websiteNodeMetadata.nodeMetadata.crawlTime = crawlTime;
          }
        }

        for (const link of crawlNode.links) {
          const linkDomain = parseDomainNameFromUrlString(link.url);
          // Skip edge to self
          if (linkDomain === crawlNodeDomain) {
            continue;
          }
          const edgeId = crawlNodeDomain.concat("/", linkDomain);
          let cytoscapeEdge = cytoscapeEdgesById.get(edgeId);
          if (cytoscapeEdge == null) {
            cytoscapeEdge = { data: { id: edgeId, source: crawlNodeDomain, target: linkDomain, weight: 0 } };
            cytoscapeEdgesById.set(edgeId, cytoscapeEdge);
          }
          cytoscapeEdge.data.weight += 1;
        }
      }
    }

    cy.add(Array.from(cytoscapeNodesByDomain.values()));
    cy.add(Array.from(cytoscapeEdgesById.values()));
    cy.layout({ name: "cose" }).run();
  }

  function switchToWebsiteView() {
    if (cy == null) {
      return;
    }
    cy.elements().remove();

    const cytoscapeNodesByURL = new Map();
    const cytoscapeEdgesById = new Map();

    for (const website of websitesByID.current.values()) {
      const websiteMetadata: CytoscapeWebsiteMetadata = {
        id: website.id,
        label: website.label,
      };
      for (const crawlNode of website.nodes) {
        const crawlNodeURL = crawlNode.url;
        let cytoscapeNode: cytoscape.ElementDefinition = cytoscapeNodesByURL.get(crawlNodeURL);
        if (cytoscapeNode == null) {
          cytoscapeNode = { data: { id: crawlNodeURL, nodeType: "website", owningWebsiteNodes: [], validCount: 0 } };
          cytoscapeNodesByURL.set(crawlNodeURL, cytoscapeNode);
        }

        // Contvert crawlTime string to date only if it is defined
        let crawlTime;
        if (crawlNode.crawlTime != null) {
          crawlTime = new Date(crawlNode.crawlTime);
        }

        if (crawlNode.valid && crawlTime) {
          cytoscapeNode.data.validCount += 1;
          if (
            cytoscapeNode.data.validCount == 1 || // first time assignment
            cytoscapeNode.data.lastCrawlTime < crawlTime // repeating assignment - lastCrawlTime should be valid
          ) {
            cytoscapeNode.data.lastCrawlTime = crawlTime;
            cytoscapeNode.data.lastTitle = crawlNode.title;
          }
        }

        const websiteNodeMetadata: CytoscapeWebsiteNodeMetadata = {
          websiteMetadata,
          nodeMetadata: {
            valid: crawlNode.valid,
            title: crawlNode.title,
            crawlTime: crawlTime,
          },
        };
        cytoscapeNode.data.owningWebsiteNodes.push(websiteNodeMetadata);

        for (const link of crawlNode.links) {
          const linkURL = link.url;
          // Skip edge to self
          if (linkURL === crawlNodeURL) {
            continue;
          }
          const edgeId = crawlNodeURL.concat("/", linkURL);
          let cytoscapeEdge = cytoscapeEdgesById.get(edgeId);
          if (cytoscapeEdge == null) {
            cytoscapeEdge = { data: { id: edgeId, source: crawlNodeURL, target: linkURL, weight: 0 } };
            cytoscapeEdgesById.set(edgeId, cytoscapeEdge);
          }
          cytoscapeEdge.data.weight += 1;
        }
      }
    }

    cy.add(Array.from(cytoscapeNodesByURL.values()));
    cy.add(Array.from(cytoscapeEdgesById.values()));
    cy.layout({ name: "cose" }).run();
  }

  useBus(
    "selection-add",
    () => {
      console.log("Website added to selection");
    },
    [],
  );
  useBus(
    "selection-remove",
    () => {
      console.log("Website removed from selection");
    },
    [],
  );
  return (
    <>
      <Alert variant="warning">visualisation of website nodes is using hardcoded data.</Alert>
      <ButtonGroup>
        <ToggleButton
          id="vis-view-website"
          type="radio"
          name="visualisation-view"
          value="website"
          variant="outline-warning"
          checked={view === "website"}
          onChange={() => {
            setView("website");
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
          onChange={() => {
            setView("domain");
            switchToDomainView();
          }}
        >
          Domain view
        </ToggleButton>
      </ButtonGroup>
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
