import { ReactNode, useState } from "preact/compat";
import { Button } from "react-bootstrap";
import ExecutionsModal from "./modals/ExecutionsModal";

export default function ShowExecutionsButton({websiteId, children} : {websiteId?: string, children?: ReactNode}) {
    const [show, setShow] = useState(false);
    return (<>
    <Button variant="info" onClick={() => setShow(true)}>{children}</Button>
    { show && <ExecutionsModal websiteId={websiteId} onClose={() => setShow(false)}/>}
    </>);
}