import { useState, useEffect, useContext } from "preact/hooks";
import { Alert, Button, Pagination, Spinner, Stack, Table } from "react-bootstrap";
import {
  WebsiteQueryParams,
  WebsiteQueryResult,
  findWebsiteMany,
} from "../services/website";
import { PAGE_LIMIT } from "../services/config";
import { WebsiteListTableRow } from "./WebsiteListTableRow";
import { findLatestExecutionForWebsite } from "../services/execution";
import { RefreshTokenContext, RequestRefreshContext } from "../contexts/RefreshContext";
import WebsiteManagerFilterForm, { WebsiteFilterParameters } from "./WebsiteManagerFilterForm";

// Fetches websites and last execution for each website
async function fetchAllData(
  websiteQuery: WebsiteQueryParams,
  signal: AbortSignal,
): Promise<WebsiteQueryResult> {
  const queryResult = await findWebsiteMany(websiteQuery, signal);
  await Promise.all(queryResult.websites.map(async (website) => {
    if (!website.id) {
      return;
    }
    website.lastExecution = await findLatestExecutionForWebsite(website.id, signal);
  }));
  return queryResult;
}

export default function WebsiteManager() {
  const [pageNumber, setPageNumber] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [firstFetch, setFirstFetch] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [emptyTableMessage, setEmptyTableMessage] = useState("");
  const [queryResult, setQueryResult] = useState<
    WebsiteQueryResult | null
  >(null);
  const [filterParameters, setFilterParameters] = useState<WebsiteFilterParameters>({});
  const refreshToken = useContext(RefreshTokenContext);
  const requestRefresh = useContext(RequestRefreshContext);

  const hasNextPage = queryResult && queryResult.websites.length == PAGE_LIMIT;
  const haveData = queryResult && queryResult.websites.length > 0;

  const tableRows = queryResult?.websites.map(website => <WebsiteListTableRow key={website.id} websiteData={website}></WebsiteListTableRow>)

  // Fetch data if parameters change
  useEffect(() => {
    setLoading(true);
    const abortController = new AbortController();
    const backendQueryParams: WebsiteQueryParams = {
      page: pageNumber,
      limit: PAGE_LIMIT,
      order: filterParameters.order,
    };
    if (filterParameters.label) {
      backendQueryParams.label = filterParameters.label;
    }
    if (filterParameters.url) {
      backendQueryParams.url = filterParameters.url;
    }
    if (filterParameters.tags) {
      backendQueryParams.tags = filterParameters.tags;
    }
    if (filterParameters.orderBy) {
      backendQueryParams.orderBy = filterParameters.orderBy;
    }
    fetchAllData(backendQueryParams, abortController.signal).then(
      (queryResult) => {
        setLoading(false);
        setFirstFetch(false);
        setErrorMessage("");
        if (queryResult.websites.length == 0) {
          setEmptyTableMessage("There are no websites");
          if (pageNumber > 1) {
            setEmptyTableMessage("That's all");
          } else if (filterParameters.label || filterParameters.tags?.length || filterParameters.url) {
            setEmptyTableMessage("No websites match specified filters");
          }
        }
        return setQueryResult(queryResult);
      }
    )
      .catch(error => {
        if (error.name == "AbortError") return;
        setLoading(false);
        setFirstFetch(false);
        setQueryResult(null);
        setErrorMessage(error.message);
      });
    return () => abortController.abort();
  }, [refreshToken, pageNumber, filterParameters]);

  return (
    <>
      <WebsiteManagerFilterForm onFilter={(filterParameters) => setFilterParameters(filterParameters)} />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <td>Show nodes</td>
            <td>Label</td>
            <td>Tags</td>
            <td>Periodicity</td>
            <td>Last execution</td>
            <td>Active</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </Table>
      {!haveData && !firstFetch && !errorMessage && <Alert variant="info">{emptyTableMessage}</Alert>}
      {firstFetch && <Alert variant="secondary">Loading..</Alert>}
      {errorMessage && (<Alert variant="danger">Couldn&apos;t load websites: {errorMessage}<Button size="sm" style={{ marginLeft: "1rem" }} onClick={requestRefresh}>Retry</Button></Alert>)}
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
    </>
  );
}
