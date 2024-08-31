import { Button, Col, Form, InputGroup, Modal, Row, Spinner } from "react-bootstrap";
import { Website } from "../../services/website";
import { TargetedEvent, useContext, useState } from "preact/compat";
import { RequestRefreshContext } from "../../contexts/RefreshContext";
import { TagsInput } from "react-tag-input-component-2";

function formDataToWebsite(formData: FormData) : Website {
    const formUrl: string  = String(formData.get("url"));
    const formRegex: string  = String(formData.get("regex"));
    const formLabel: string  = String(formData.get("label"));
    let formTagString: string  = String(formData.get("tags"));
    if(formTagString.endsWith(",")) {
        formTagString = formTagString.slice(0,formTagString.length - 1);
    }
    const tags = formTagString.length > 0 ? formTagString.split(",") : [];
    const formPeriodicityValue: string  = String(formData.get("periodicity-value"));
    const formPeriodicityUnit: string = String(formData.get("periodicity-unit"));
    const formActive : File | string | null = formData.get("active");
    const website: Website = {
        "url": formUrl,
        "regex": formRegex,
        "label": formLabel,
        "tags": tags,
        "periodicity": {
            value: parseInt(formPeriodicityValue),
            unit: formPeriodicityUnit,
        },
        "active": (formActive === "on"),
    };
    return website;
}

export default function WebsiteFormModal({ initialWebsiteData, onClose, onSubmitWebsite, submitButtonText, cancelButtonText, headerText }: { initialWebsiteData: Website, onClose: () => void, onSubmitWebsite: (website : Website) => Promise<unknown>, submitButtonText?: string, cancelButtonText?: string, headerText?: string }) {
    const requestRefresh = useContext(RequestRefreshContext);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [ tags, setTags ] = useState<string[]>(initialWebsiteData.tags);

    // Basic check that url begins with http:// or https://
    const urlRegex = "^https?://.*";


    function handleSubmit(event: TargetedEvent) {
        event.preventDefault();
        if(isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        const form = event.target;
        const formData = new FormData(form as HTMLFormElement);
        const newWebsite = formDataToWebsite(formData);
        newWebsite.tags = tags;
    onSubmitWebsite(newWebsite).then(
      () => {
        setErrorMessage("");
        requestRefresh();
        onClose();
      }
    ).catch((error) => {
      setErrorMessage(error.toString());
      setIsSubmitting(false);
    });
  }

    return (<>
        <Modal show={true} onHide={onClose}>
            <Modal.Header>
                <Modal.Title>{headerText}</Modal.Title>
            </Modal.Header>
            <Form validated={true} onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row className="mb-3">
                        <Col sm={3}>
                            <Form.Label>URL</Form.Label>
                        </Col>
                        <Col>
                            <Form.Control
                                name="url"
                                type="url"
                                pattern={urlRegex}
                                placeholder="http://www.example.com"
                                defaultValue={initialWebsiteData.url}
                                required
                            ></Form.Control>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={3}>
                            <Form.Label htmlFor="regex">Boundary regular expression</Form.Label>
                        </Col>
                        <Col>
                            <Form.Control
                                name="regex"
                                id="regex"
                                defaultValue={initialWebsiteData.regex}
                                required
                            ></Form.Control>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={3}>
                            <Form.Label>Label</Form.Label>
                        </Col>
                        <Col>
                            <Form.Control
                                name="label"
                                defaultValue={initialWebsiteData.label}
                                required
                            ></Form.Control>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={3}></Col>
                        <Col></Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={3}>
                            <Form.Label>Tags</Form.Label>
                        </Col>
                        <Col>
                            <TagsInput value={tags} onChange={setTags} name="tags" placeHolder="enter tags" beforeAddValidate={(newTag, existingTags) =>  newTag.length <= 25 && existingTags.length < 10} />
                            <Form.Text className="mx-2" muted>
                                Enter up to 10 tags
                            </Form.Text>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col sm={3}>
                            <Form.Label>Crawl periodicity</Form.Label>
                        </Col>
                        <Col>
                            <InputGroup>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    name="periodicity-value"
                                    defaultValue={String(initialWebsiteData.periodicity.value)}
                                ></Form.Control>
                                <Form.Select
                                    name="periodicity-unit"
                                    defaultValue={initialWebsiteData.periodicity.unit}
                                >
                                    <option value="day">day(s)</option>
                                    <option value="hour">hour(s)</option>
                                    <option value="minute">minute(s)</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col xs={"auto"} sm={3}>
                            <Form.Label>Crawling active</Form.Label>
                        </Col>
                        <Col>
                            <Form.Check name="active" defaultChecked={initialWebsiteData.active} />
                        </Col>
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    {errorMessage && <span className="text-danger">{errorMessage}</span>}
                    {isSubmitting && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />}
                    <Button type="submit" variant="success" disabled={isSubmitting}>{submitButtonText}</Button>
                    <Button variant="secondary" onClick={onClose}>{cancelButtonText}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    </>);
}
