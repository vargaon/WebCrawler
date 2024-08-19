import { Link, Form as RemixForm, useOutletContext, useRevalidator } from "@remix-run/react";
import { Button, Col, Row } from "react-bootstrap";
import { WebsiteActiveToggleSwitch } from "~/components/WebsiteActiveToggleSwitch";
import type { Website } from "~/services/website";


export default function WebsiteDetail() {
    const websiteData = useOutletContext<Website>();
    const revalidator = useRevalidator();
    return <>
    <h1>Website detail</h1>
    <Row className="mb-3">
        <Col sm={3}>URL</Col>
        <Col><a href={websiteData.url}>{websiteData.url}</a></Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Boundary regex</Col>
        <Col>{websiteData.regex}</Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Label</Col>
        <Col>{websiteData.label}</Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Tags</Col>
        <Col>{websiteData.tags.join(",")}</Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Crawl periodicity</Col>
        <Col>{websiteData.periodicity.value} {websiteData.periodicity.unit}(s)</Col>
    </Row>
    <Row className="mb-3">
        <Col xs={"auto"} sm={3}>Crawling active</Col>
        <Col>
        <WebsiteActiveToggleSwitch key={websiteData.id} websiteData={websiteData} />
        </Col>
    </Row>
    <Link className="btn btn-primary" to={"../edit"}>Edit</Link>
    <RemixForm action="../delete" method="post" onSubmit={(event) => {
            const response = confirm(
                "Delete this website record with its executions and all its crawled data?"
              );
              if (!response) {
                event.preventDefault();
              }
            }}>
        <Button type="submit" variant="danger">Delete</Button>
    </RemixForm>
    <button className="btn btn-success" onClick={() => {if (revalidator.state === 'idle') {
  revalidator.revalidate();
}
}}>Refresh</button>
    </>
}