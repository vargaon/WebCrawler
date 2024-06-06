import { Row, Col, Form, InputGroup } from "react-bootstrap";
import type { Website } from "~/services/website";

export function WebsiteFormFields({websiteData} : {websiteData: Website}) {
    // Basic check that url begins with http:// or https://
    const urlRegex = "^https?://.*";
    // TODO: validate that regexp matches starting URL
    return (
        <>
        <Row className="mb-3">
            <Col sm={3}><Form.Label>URL</Form.Label></Col>
            <Col><Form.Control name="url" type="url" pattern={urlRegex} placeholder="http://www.example.com" defaultValue={websiteData.url} required></Form.Control></Col>
        </Row>
        <Row className="mb-3">
            <Col sm={3}><Form.Label htmlFor="regex">Boundary regular expression</Form.Label></Col>
            <Col><Form.Control name="regex" id="regex" defaultValue={websiteData.regex} required></Form.Control></Col>
        </Row>
        <Row className="mb-3">
            <Col sm={3}><Form.Label>Label</Form.Label></Col>
            <Col><Form.Control name="label" defaultValue={websiteData.label} required></Form.Control></Col>
        </Row>
        <Row className="mb-3">
            <Col sm={3}></Col>
            <Col></Col>
        </Row>
        <Row className="mb-3">
            <Col sm={3}><Form.Label>Tags</Form.Label></Col>
            <Col><Form.Control name="tags" pattern="[^,]{1,25}(,[^,]{1,25}){0,9}" defaultValue={websiteData.tags.join(",")}></Form.Control><Form.Text className="mx-2" muted>Comma-separated list of up to 10 tags</Form.Text></Col>
        </Row>
        <Row className="mb-3">
            <Col sm={3}><Form.Label>Crawl periodicity</Form.Label></Col>
            <Col>
                <InputGroup>
                    <Form.Control type="number" min="1" name="periodicity-value" defaultValue={websiteData.periodicity.value}></Form.Control>
                    <Form.Select     name="periodicity-unit" defaultValue={websiteData.periodicity.unit}>
                        <option value="day">day(s)</option>
                        <option value="hour">hour(s)</option>
                        <option value="minute">minute(s)</option>
                    </Form.Select>
                </InputGroup>

            </Col>
        </Row>
            
        <Row className="mb-3">
            <Col xs={"auto"} sm={3}><Form.Label>Active</Form.Label></Col>
            <Col><Form.Check name="active" defaultChecked={websiteData.active} /></Col>
        </Row>
        </>
    );
}