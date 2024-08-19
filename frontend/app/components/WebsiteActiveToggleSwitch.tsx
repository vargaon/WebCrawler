import { useState } from "react";
import { Form } from "react-bootstrap";
import { Website, editWebsite } from "~/services/website";

export function WebsiteActiveToggleSwitch({websiteData} : {websiteData: Website}) {

    // const [active, setActive] = useState(websiteData.active);
    const [state, setState] = useState({
        updating: false,
        lastErrorMessage: "",
    });
    return <div className="d-flex align-items-center" >
        <Form.Check 
            type="switch"
            checked={websiteData.active}
            disabled={state.updating}
            onChange={
                () => {
                    if(websiteData.id == null) {
                        return;
                    }
                    setState({
                        updating: true,
                        lastErrorMessage: "",
                    });
                    const newWebsiteData = {id: websiteData.id, active: !websiteData.active};
                    const action = newWebsiteData.active ? "activate" : "deactivate";
                    editWebsite(websiteData.id, newWebsiteData).then(() => {
                        websiteData.active = newWebsiteData.active; // Write back modified value
                        setState({updating: false, lastErrorMessage: ""});
                    }).catch((err) => {
                        // Update failed, revert
                        setState({
                            updating: false,
                            lastErrorMessage: `Failed to ${action}: ${err.message}`,
                        });
                    });
                }
        }></Form.Check>
        <span className={state.updating ? "spinner-border spinner-border-sm" : ""}></span>
        <span className="text-danger">{state.lastErrorMessage}</span>
    </div>
}