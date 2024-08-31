import { format } from "timeago.js";
import { Execution } from "../services/execution";

export function ExecutionListTableRow({
  executionData,
}: {
  executionData: Execution;
}) {
  return (
    <tr>
      <td>{executionData.websiteLabel}</td>
      <td>{executionData.status}</td>
      <td>{executionData.startTime}{executionData.startTime && ` (${format(executionData.startTime)})`}</td>
      <td>{executionData.endTime}{executionData.endTime && ` (${format(executionData.endTime)})`}</td>
      <td>{executionData.siteCount}</td>
    </tr>
  );
}
