import { Link, useOutletContext } from "@remix-run/react";
import { Col, Form, Row } from "react-bootstrap";
import type { Website } from "~/services/website";


export default function WebsiteDetail() {
    const context = useOutletContext<Website>();
    return <>
    <h1>Website detail</h1>
    <Row className="mb-3">
        <Col sm={3}>URL</Col>
        <Col><a href={context.url}>{context.url}</a></Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Boundary regex</Col>
        <Col>{context.regex}</Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Label</Col>
        <Col>{context.label}</Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Tags</Col>
        <Col>{context.tags.join(",")}</Col>
    </Row>
    <Row>
        <Col sm={3}>Crawl periodicity</Col>
        <Col>{context.periodicity.value} {context.periodicity.unit}(s)</Col>
    </Row>
    <Row>
        <Col xs={"auto"} sm={3}>Active</Col>
        <Col><Form.Check checked={context.active} disabled></Form.Check></Col>
    </Row>
    <Link className="btn btn-primary" to={"../edit"}>Edit</Link>
    </>
}