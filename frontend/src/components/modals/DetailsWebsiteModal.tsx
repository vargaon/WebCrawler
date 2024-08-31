import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Website } from "../../services/website";
import { Col, Row } from "react-bootstrap";

export default function DetailsWebsiteModal({ websiteData, onClose }: { websiteData: Website, onClose: () => void }) {

  const tagElements = websiteData.tags?.map((tag, index) => <span key={index} className="btn btn-dark mx-1 py-0">{tag}</span>)
  return (
    <Modal show={true} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>Website details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
        <Col>{tagElements}</Col>
    </Row>
    <Row className="mb-3">
        <Col sm={3}>Crawl periodicity</Col>
        <Col>{websiteData.periodicity.value} {websiteData.periodicity.unit}(s)</Col>
    </Row>
    <Row className="mb-3">
        <Col xs={"auto"} sm={3}>Crawling active</Col>
        <Col>
        {websiteData.active ? "yes" : "no"}
        </Col>
    </Row>
      </Modal.Body>
      <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
