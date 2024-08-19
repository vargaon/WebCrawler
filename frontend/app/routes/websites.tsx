import type { MetaFunction } from "@remix-run/node";
import { ClientLoaderFunctionArgs, Link, Form as RemixForm, useLoaderData, useSearchParams } from "@remix-run/react";
import { Alert, Button, Col, Form, FormLabel, Pagination, Row, Stack, Table } from "react-bootstrap";
import { WebsiteListTableRow } from "~/components/WebsiteListTableRow";
import { WebsiteQueryParams, WebsiteQueryResult, findWebsiteMany } from "~/services/website";
import { PAGE_LIMIT } from "~/services/config";
import { findLatestExecutionForWebsite } from "~/services/execution";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export const clientLoader = async({request} : ClientLoaderFunctionArgs) => {
  const url = new URL(request.url);
  const frontendQueryParams = url.searchParams;
  const backendQueryParams: WebsiteQueryParams = {};
  backendQueryParams.limit = PAGE_LIMIT;
  
  const websiteUrl = frontendQueryParams.get("url")
  if(websiteUrl != null) {
    backendQueryParams.url = websiteUrl;
  }
  const websiteLabel = frontendQueryParams.get("label");
  if(websiteLabel != null) {
    backendQueryParams.label = websiteLabel;
  }
  const websiteListOrderBy = frontendQueryParams.get("orderBy");
  if(websiteListOrderBy != null) {
      backendQueryParams.orderBy = websiteListOrderBy;
  }
  const websiteListOrder = frontendQueryParams.get("order");
  if(websiteListOrder != null) {
    backendQueryParams.order = websiteListOrder;
  }
  const websiteListPage = frontendQueryParams.get("page");
  if(websiteListPage) {
    if(/^[1-9][0-9]*$/.test(websiteListPage)) {
      backendQueryParams.page = parseInt(websiteListPage);
    } else {
      throw new Error("invalid page number");
    }
  }
  const queryResult = await findWebsiteMany(backendQueryParams);
  // fetch last execution
  await Promise.all(queryResult.websites.map(async (website) => {
      if(!website.id) {
        return;
      }
      website.lastExecution = await findLatestExecutionForWebsite(website.id);
  }));
  return queryResult;
}

export default function Index() {
  const { websites } = useLoaderData<WebsiteQueryResult>();
  const [searchParams] = useSearchParams();
  const pageSearchParam = searchParams.get("page");
  let pageNumber = 1;
  if(pageSearchParam && /^[1-9][0-9]*$/.test(pageSearchParam)) {
    pageNumber = parseInt(pageSearchParam);
  }
  const previousPageNumber = pageNumber - 1;
  const nextPageNumber = pageNumber + 1;
  searchParams.set("page", previousPageNumber.toString());
  const previousPageLink = "?" + searchParams.toString();
  searchParams.set("page", nextPageNumber.toString());
  const nextPageLink = "?" + searchParams.toString();
  searchParams.set("page",  pageNumber.toString());

  // Guess if there are more pages in the paginated list
  const hasNextPage = websites.length == PAGE_LIMIT;

  let emptyTableMessage = "";
  if(websites.length == 0) {
    if(pageNumber > 1) {
      emptyTableMessage = "That's all";
    } else if(
      searchParams.get("url") ||
      searchParams.get("label") ||
      searchParams.getAll("tags").some(x => x)
    ) {
      emptyTableMessage = "No website records match specified filters";
    } else {
      emptyTableMessage = "There are no websites";
    }
  }
  
  const tableRows = websites.map(website => <WebsiteListTableRow key={website.id} websiteData={website}></WebsiteListTableRow>)
  return <>
  <Row>
    <Col>
    <h1>Websites</h1>
    </Col>
    <Col xs="auto" className="my-auto"> 
    <Link className="btn btn-success" to={"create"}>Add</Link>
    </Col>
    </Row>
    <Form method="GET" as={RemixForm} noValidate={true}>
      <Row className="mb-3">
        <Form.Label className="col-sm-3">URL
       <Form.Control name="url" type="url" defaultValue={searchParams.get("url")}></Form.Control>
        </Form.Label>

        <Form.Label className="col-sm-3">Label
       <Form.Control name="label" defaultValue={searchParams.get("label")}></Form.Control>
        </Form.Label>

        <Form.Label className="col-sm-3">Tags
       <Form.Control></Form.Control>
        </Form.Label>

       <FormLabel className="col-sm-3">Order by
       <Form.Select name="order">
        <option value="id">default</option>
        <option value="url">URL</option>
        <option value="endTime">Last execution</option>
       </Form.Select>
       </FormLabel>
       <Button type="submit">Filter/Sort</Button>
      </Row>
    </Form>
    <Table striped bordered hover>
      <thead>
        <tr>
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
        {websites.length == 0 ? (<Alert variant="info">{emptyTableMessage}</Alert>) : undefined}
    <Pagination>
      <Pagination.Prev disabled={pageNumber <= 1} as={Link} to={pageNumber > 1 ? previousPageLink : undefined} />
      <Pagination.Item active>{pageNumber}</Pagination.Item>
      <Pagination.Next disabled={!hasNextPage} as={Link} to={hasNextPage ? nextPageLink : undefined} />
    </Pagination>
  </>
}
