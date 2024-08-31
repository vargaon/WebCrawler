import { useContext, useState } from "preact/compat";
import {
  Button, CloseButton,
  ListGroup,
  Overlay,
  Popover
} from "react-bootstrap";
import { SelectionContext } from "../contexts/SelectionContext";
import { dispatch } from "use-bus";
import CreateWebsiteModal from "./modals/CreateWebsiteModal";
import { RequestRefreshContext } from "../contexts/RefreshContext";
import { createExecution } from "../services/website";
import { VisualisationNodeData } from "./Visualisation";

export function NodeDetailsPopover({
  target, show, nodeData, onClose,
}: {
  target: HTMLElement;
  show: boolean;
  nodeData?: VisualisationNodeData;
  onClose: () => void;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const requestRefresh = useContext(RequestRefreshContext);
  const selectedSet = useContext(SelectionContext);
  if (nodeData == null) return <></>;

  function startExecution(websiteId: string) {
    createExecution(websiteId).then(() => setTimeout(requestRefresh, 10));
  }

  const newWebsiteData = {
    url: nodeData.id,
    regex: nodeData.id.concat("/.*"),
    label: "",
    tags: [],
    periodicity: {
      value: 1,
      unit: "day",
    },
    active: true,
  };

  const websiteList = nodeData.owningWebsiteNodes
    .filter((metadata) => metadata.nodeMetadata.valid)
    .map((metadata) => {
      return (
        <ListGroup.Item key={metadata.websiteMetadata.id}>
          <h5 className="mb-1">{metadata.websiteMetadata.label}</h5>
          <div className="d-flex justify-content-between">
            <small>{metadata.nodeMetadata.crawlTime?.toString()}</small>
            <Button variant="link" onClick={() => startExecution(metadata.websiteMetadata.id)}>
              Start execution
            </Button>
          </div>
        </ListGroup.Item>
      );
    });
  return (
    <>
      <Overlay target={target} show={show} placement="bottom">
        <Popover id="node-detail-popover">
          <Popover.Header className="modal-header">
            <div className="popover-title">{nodeData.id}</div>
            <CloseButton onClick={onClose} />
          </Popover.Header>
          <Popover.Body>
            <dl>
              <dt>{nodeData.nodeType === "domain" ? "Domain:" : "URL:"}</dt>
              <dd>{nodeData.id}</dd>
              {nodeData.validCount > 0 && (
                <>
                  <dt>Last crawl time:</dt>
                  <dd>{nodeData.lastCrawlTime?.toString()}</dd>
                </>
              )}
            </dl>
            <hr />
            <ListGroup>{websiteList}</ListGroup>
            {nodeData.validCount == 0 && <p>This node has not been crawled by any website in your selection.</p>}
            {nodeData.validCount == 0 && <Button onClick={() => setShowCreateModal(true)}>Add to WebCrawler</Button>}
          </Popover.Body>
        </Popover>
      </Overlay>
      {showCreateModal && (
        <CreateWebsiteModal
          initialWebsiteData={newWebsiteData}
          onClose={() => setShowCreateModal(false)}
          onCreate={(newWebsite) => {
            if (newWebsite?.id == null) return;
            selectedSet.add(newWebsite.id);
            dispatch({ type: "selection-add", websiteId: newWebsite.id });
          }} />
      )}
    </>
  );
}
