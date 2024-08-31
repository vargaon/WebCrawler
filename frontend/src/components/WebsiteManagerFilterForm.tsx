import { TargetedEvent, useState } from "preact/compat";
import { Button, Form, FormLabel, Row } from "react-bootstrap";
import { TagsInput } from "react-tag-input-component-2";

export interface WebsiteFilterParameters {
  url?: string,
  label?: string,
  tags?: string[],
  orderBy?: string,
  order?: string,
}

export default function WebsiteManagerFilterForm({onFilter} : { onFilter : (filterParameters: WebsiteFilterParameters) => void}) {
  const [tags, setTags] = useState<string[]>([]);

  function handleSubmit(event: TargetedEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const filterParameters : WebsiteFilterParameters = {
      url: formData.get("url")?.toString() ?? "",
      label: formData.get("label")?.toString() ?? "",
      orderBy: formData.get("orderBy")?.toString() ?? "",
      order: formData.get("order")?.toString() ?? "",
      tags: tags
    };
    onFilter(filterParameters);
  }
    return (<>
        <Form noValidate={true} onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Label className="col-md">URL
       <Form.Control name="url" type="url" defaultValue={""}></Form.Control>
        </Form.Label>

        <Form.Label className="col-md">Label
       <Form.Control name="label" defaultValue={""}></Form.Control>
        </Form.Label>

        <Form.Label className="col-md">Tags
        <TagsInput value={tags} onChange={setTags} name="tags" placeHolder="" />
        </Form.Label>

       <FormLabel className="col-md">Order by
       <Form.Select name="orderBy">
        <option value="">default</option>
        <option value="url">URL</option>
        <option value="endTime">Last execution</option>
       </Form.Select>
       </FormLabel>
       <FormLabel className="col-md">Order
       <Form.Select name="order">
       <option value="DESC">descending</option>
        <option value="ASC">ascending</option>
       </Form.Select>
       </FormLabel>
       <div className="">
       <Button className="col-12" type="submit">Filter/Sort</Button>
      </div>
      </Row>
    </Form>
    </>);
}