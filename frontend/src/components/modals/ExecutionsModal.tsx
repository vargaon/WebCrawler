import { useEffect, useState } from "preact/hooks";
import { Form, FormLabel, Pagination, Row, Spinner, Stack } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ExecutionQueryParams, ExecutionQueryResult, findExecutionMany } from "../../services/execution";
import { PAGE_LIMIT } from "../../services/config";
import { Website, getWebsite } from "../../services/website";
import ExecutionsTable from "../ExecutionsTable";
import { TargetedEvent } from "preact/compat";

// Fetches executions and website label for each execution
async function fetchAllData(
    executionsQuery: ExecutionQueryParams,
    signal: AbortSignal,
): Promise<ExecutionQueryResult> {
    const queryResult = await findExecutionMany(executionsQuery, signal);
    // fetch website label for each execution
    const websiteIds = new Set<string>();
    for (const execution of queryResult.executions) {
        websiteIds.add(execution.websiteId);
    }
    const websitesById = new Map<string, Website>();
    const websitePromises = [];
    for (const websiteId of websiteIds) {
        websitePromises.push(getWebsite(websiteId, signal).then(
            (website) => {
                if (website.id == undefined) return;
                websitesById.set(website.id, website)
            })
        );
    }
    await Promise.all(websitePromises);
    for(const execution of queryResult.executions) {
        execution.websiteLabel = websitesById.get(execution.websiteId)?.label;
      }
    return queryResult;
}


export default function ExecutionsModal({ onClose, websiteId }: { onClose: () => void, websiteId?: string }) {
    const [pageNumber, setPageNumber] = useState(1);
    const [isLoading, setLoading] = useState(true);
    const [queryResult, setQueryResult] = useState<ExecutionQueryResult | null>(null);
    const [submittedFormData, setSubmittedFormData ] = useState(new FormData());

    const hasNextPage = queryResult?.executions.length == PAGE_LIMIT;
    let emptyTableMessage = "There are no executions";
    if (pageNumber > 1) {
        emptyTableMessage = "That's all";
    } else if(submittedFormData.get("status")) {
        emptyTableMessage = `There are no ${submittedFormData.get("status")} executions`;
    }

    // Fetch data if parameters change
    useEffect(() => {
        setLoading(true);
        const abortController = new AbortController();
        const backendQueryParams: ExecutionQueryParams = {
            websiteId,
            page: pageNumber,
            limit: PAGE_LIMIT,
        };
        const executionListStatus = submittedFormData.get("status");
        if(executionListStatus) {
            backendQueryParams.status = executionListStatus.toString();
        }
        const executionListOrderBy = submittedFormData.get("orderBy");
        if(executionListOrderBy) {
            backendQueryParams.orderBy = executionListOrderBy.toString();
        }
        const executionListOrder = submittedFormData.get("order");
        if(executionListOrder) {
          backendQueryParams.order = executionListOrder.toString();
        }

        fetchAllData(backendQueryParams, abortController.signal).then(
            (queryResult) => {
                setLoading(false);
                return setQueryResult(queryResult);
            }
        )
            .catch(error => {
                if (error.name == "AbortError") return;
                setLoading(false);
                throw error;
            });
        return () => abortController.abort();
    }, [pageNumber, submittedFormData]);

    function handleSubmit(event: TargetedEvent) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form as HTMLFormElement);
        setPageNumber(1);
        setSubmittedFormData(formData);
    }

    return (
        <Modal show={true} onHide={onClose} scrollable={true}>
            <Modal.Header>
                <Modal.Title>Executions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form noValidate={true} onSubmit={handleSubmit}>
      <Row className="mb-3">
       <FormLabel className="col-sm-3">Status
       <Form.Select name="status">
        <option value="">all</option>
        <option value="pending" selected={submittedFormData.get("status") === "pending"}>pending</option>
        <option value="running" selected={submittedFormData.get("status") === "running"}>running</option>
        <option value="completed" selected={submittedFormData.get("status") === "completed"}>completed</option>
       </Form.Select>
       </FormLabel>
       <FormLabel className="col-sm-3">Order by
       <Form.Select name="orderBy">
        <option value="startTime">Start time</option>
        <option value="endTime" selected={submittedFormData.get("orderBy") === "endTime"}>End time</option>
        <option value="siteCount" selected={submittedFormData.get("orderBy") === "siteCount"}>Site count</option>
        <option value="status" selected={submittedFormData.get("orderBy") === "status"}>Status</option>
       </Form.Select>
       </FormLabel>

       <FormLabel className="col-sm-3">Order
       <Form.Select name="order">
        <option value="DESC">descending</option>
        <option value="ASC">ascending</option>
       </Form.Select>
       </FormLabel>
       <button className="col-sm-3 btn btn-primary mb-3 mx-auto my-auto" type="submit">Filter/Sort</button>
      </Row>
    </Form>

                <ExecutionsTable executions={queryResult?.executions} />
                {queryResult?.executions.length == 0 ? (<Alert variant="info">{emptyTableMessage}</Alert>) : undefined}
                <Stack direction="horizontal">

                    <Pagination>
                        <Pagination.Prev
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber(pageNumber - 1)}
                        />
                        <Pagination.Item active>{pageNumber}</Pagination.Item>
                        <Pagination.Next
                            disabled={!hasNextPage}
                            onClick={() => setPageNumber(pageNumber + 1)}
                        />
                    </Pagination>
                    {isLoading && <Spinner style={{ marginBottom: "1rem", marginLeft: "1rem" }} animation="border"></Spinner>}
                </Stack>

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
