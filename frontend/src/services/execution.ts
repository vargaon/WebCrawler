import { PUBLIC_API_BASE } from "./config";

export interface Execution {
  id: string;
  startTime: string;
  endTime: string;
  siteCount: number;
  status: string;
  websiteId: string;
  websiteLabel?: string;
}

export interface ExecutionQueryParams {
  websiteId?: string;
  label?: string;
  status?: string;
  orderBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

// Extra info for query results could be added:
// metadata about search (number of pages total, number of results)
export interface ExecutionQueryResult {
  executions: Execution[];
}

export function findExecutionMany(
  query: ExecutionQueryParams,
  signal?: AbortSignal,
): Promise<ExecutionQueryResult> {
  const urlParams = new URLSearchParams();
  // Add all parameters to query string
  let param: keyof ExecutionQueryParams;
  for (param in query) {
    if (Object.prototype.hasOwnProperty.call(query, param)) {
      const paramValue = query[param];
      if (paramValue == null) {
        continue;
      }
      urlParams.append(param, paramValue?.toString());
    }
  }
  const request = new Request(
    PUBLIC_API_BASE + "api/v1/executions?" + urlParams.toString(),
    { method: "GET", signal },
  );
  return fetch(request).then((response) => {
    if (!response.ok) {
      throw new Error("HTTP Error" + response.status);
    }
    return response.json().then((executions) => {
      return { executions: executions };
    });
  });
}

export async function findLatestExecutionForWebsite(
  websiteId: string,
  signal?: AbortSignal
): Promise<Execution | undefined> {
  const executionList = (
    await findExecutionMany({
      websiteId: websiteId,
      limit: 1,
      orderBy: "endTime",
      order: "DESC",
    }, signal)
  ).executions;
  return executionList[0];
}
