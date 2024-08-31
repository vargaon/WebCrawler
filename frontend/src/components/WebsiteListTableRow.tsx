import { Button, Dropdown } from "react-bootstrap";
import { Website, createExecution, deleteWebsite } from "../services/website";
import { WebsiteActiveToggleSwitch } from "./WebsiteActiveToggleSwitch";
import ShowExecutionsButton from "./ShowExecutionsButton";
import DetailsWebsiteModal from "./modals/DetailsWebsiteModal";
import { useContext, useState } from "preact/hooks";
import EditWebsiteModal from "./modals/EditWebsiteModal";
import { RequestRefreshContext } from "../contexts/RefreshContext";
import { format } from "timeago.js";
import WebsiteSelectionSwitch from "./WebsiteSelectionSwitch";


export function WebsiteListTableRow({ websiteData }: { websiteData: Website }) {
  const requestRefresh = useContext(RequestRefreshContext);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  function confirmDelete(websiteId: string) {
      const response = confirm(
        "Delete this website record with its executions and all its crawled data?"
      );
      if (!response) {
        return;
      }
      deleteWebsite(websiteId).then(() => {
        setTimeout(requestRefresh, 10);
      });
    }

    const tagElements = websiteData.tags?.map((tag, index) => <span key={index} className="btn btn-dark py-0 mx-1">{tag}</span>);
    let timeAgoString = "";
    if(websiteData.lastExecution?.endTime)
      timeAgoString = format(websiteData.lastExecution.endTime);
    else if(websiteData.lastExecution?.startTime)
      timeAgoString = format(websiteData.lastExecution.startTime);

    function startExecution(websiteId?: string) {
      if(!websiteId) return;
      createExecution(websiteId).then(() => setTimeout(requestRefresh, 10));
    }

return (<>
    <tr>
      <td><WebsiteSelectionSwitch websiteId={websiteData.id!}/></td>
      <td>{websiteData.label}</td>
      <td>{tagElements}</td>
      <td>
        {websiteData.periodicity.value} {websiteData.periodicity.unit}(s)
      </td>
      <td>
        {websiteData.lastExecution?.status}{" "}
        {timeAgoString}
      </td>
      <td>
        <WebsiteActiveToggleSwitch websiteData={websiteData} />
      </td>
      <td style={{textAlign: "right"}}>
        <Button onClick={() => setShowDetails(true)}>Details</Button>
        {showDetails && <DetailsWebsiteModal websiteData={websiteData} onClose={() => setShowDetails(false)} />}
        {showEdit && <EditWebsiteModal websiteData={websiteData} onClose={() => setShowEdit(false)} />}
        {" "}
        <ShowExecutionsButton websiteId={websiteData.id}>Executions</ShowExecutionsButton>
        {" "}
        <Dropdown as="span" align={"end"}><Dropdown.Toggle variant="secondary">Action</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item as="button" onClick={() => {startExecution(websiteData.id)}}>Start execution now</Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => setShowEdit(true)}>Edit</Dropdown.Item>
            <Dropdown.Item as="button" onClick={() => confirmDelete(websiteData.id!)}>Delete</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  </>);
}
