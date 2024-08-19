import { Link } from "@remix-run/react";
import { Button } from "react-bootstrap";
import { Website } from "~/services/website";
import { WebsiteActiveToggleSwitch } from "./WebsiteActiveToggleSwitch";

export function WebsiteListTableRow({websiteData} : {websiteData: Website}) {
    return <tr>
        <td>{websiteData.label}</td>
        <td>{websiteData.tags.join(",")}</td>
        <td>{websiteData.periodicity.value} {websiteData.periodicity.unit}(s)</td>
        <td>{websiteData.lastExecution?.startTime} {websiteData.lastExecution?.status}</td>
        <td><WebsiteActiveToggleSwitch websiteData={websiteData} /></td>
        <td><Button as={Link} to={"/website/" + websiteData.id + "/detail"}>Details</Button></td>
    </tr>
}