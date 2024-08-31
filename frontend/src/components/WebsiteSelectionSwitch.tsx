import { useContext, useState } from "preact/hooks";
import { SelectionContext } from "../contexts/SelectionContext";
import { Form } from "react-bootstrap";
import { dispatch } from "use-bus";

export default function WebsiteSelectionSwitch({ websiteId }: { websiteId: string }) {
  const selectedSet = useContext(SelectionContext);
  const [isSelected, setSelected] = useState(selectedSet.has(websiteId));

  return (
    <>
      <Form.Check
        type="switch"
        checked={isSelected}
        onChange={() => {
          const newSelected = !isSelected;
          setSelected(newSelected);
          if (newSelected) {
            selectedSet.add(websiteId);
            dispatch({ type: "selection-add", websiteId });
          } else {
            dispatch({ type: "selection-remove", websiteId });
            selectedSet.delete(websiteId);
          }
        }}
      ></Form.Check>
    </>
  );
}
