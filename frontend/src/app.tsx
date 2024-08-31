import { useState } from "preact/hooks";
import { Col, Row } from "react-bootstrap";
import CreateWebsiteModal from "./components/modals/CreateWebsiteModal";
import WebsiteManager from "./components/WebsiteManager";
import ExecutionsModal from "./components/modals/ExecutionsModal";
import { RefreshTokenContext, RequestRefreshContext } from "./contexts/RefreshContext";
import { SelectionContext } from "./contexts/SelectionContext";
import { Suspense, lazy } from "preact/compat";
const Visualisation = lazy(() => import("./components/Visualisation"));

export function App() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecutions, setShowExecutions] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [ selection ] = useState(new Set<string>());
  function requestRefresh() {
    setRefreshToken(refreshToken + 1);
  }

  return (
    <>
      <RefreshTokenContext.Provider value={refreshToken}>
        <RequestRefreshContext.Provider value={requestRefresh}>
          <SelectionContext.Provider value={selection}>

            <Row>
              <Col>
                <h1>WebCrawler</h1>
              </Col>
              <Col xs="auto" className="my-auto">
                <button className="btn btn-info" onClick={() => setShowExecutions(true)}>
                  All executions
                </button>{" "}
                <button className="btn btn-success" onClick={() => setShowCreateModal(true)}>
                  Add website
                </button>
              </Col>
            </Row>
            <WebsiteManager />
            <hr />
            <Suspense fallback={<></>}>
            <Visualisation />
            </Suspense>
            {showCreateModal && <CreateWebsiteModal onClose={() => setShowCreateModal(false)} />}
            {showExecutions && <ExecutionsModal onClose={() => setShowExecutions(false)} />}
          </SelectionContext.Provider>
        </RequestRefreshContext.Provider>
      </RefreshTokenContext.Provider>
    </>
  );
}
