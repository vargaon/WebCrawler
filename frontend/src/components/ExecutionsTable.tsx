import { Table } from "react-bootstrap";
import { ExecutionListTableRow } from "./ExecutionListTableRow";
import { memo } from "preact/compat";
import { Execution } from "../services/execution";

const ExecutionsTable = memo(function ExecutionsTable({executions} : {executions: Execution[] | undefined}) {
    const tableRows = executions?.map(execution => <ExecutionListTableRow key={execution.id} executionData={execution}></ExecutionListTableRow>)

    return (
        <>
        <Table striped bordered hover>
                    <thead>
                        <tr>
                            <td>Label</td>
                            <td>Status</td>
                            <td>Start time</td>
                            <td>End time</td>
                            <td>Site count</td>
                        </tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>
                </Table>

        </>
    )
})

export default ExecutionsTable;