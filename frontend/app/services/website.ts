import { PUBLIC_API_BASE } from "./config";
import { Execution } from "./execution";

export interface Periodicity {
    value: number;
    unit: string;
}

export interface Website {
    id?: string;
    label: string;
    url: string;
    tags: string[];
    regex: string;
    periodicity: Periodicity;
    active: boolean;
    lastExecution?: Execution;
}

export interface WebsiteQueryParams {
    url?: string;
    label?: string;
    tags?: string[];
    orderBy?: string; // 'endTime', 'url', 'label', 'regex', 'active'
    order?: string; // 'ASC', 'DESC', default: 'DESC'
    page?: number;
    limit?: number;
}

// Extra info for query results should be added:
// metadata about search (number of pages total, number of results)
export interface WebsiteQueryResult {
    websites: Website[];
}

export function createWebsite(website: Website) : Promise<Website> {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records", { method: "POST", headers: {"Content-Type": "application/json", "Accept": "application/json"}, body: JSON.stringify(website) });
    return fetch(request).then(response => {if(response.status != 201) throw new Error("HTTP Error" + response.status); return response.json()});
}

export function getWebsite(id: string) : Promise<Website> {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records/" + id, { method: "GET" });
    return fetch(request).then(response => {if(!response.ok) throw new Error("HTTP Error " + response.status + " " + response.statusText + " from API"); return response.json()});    
}

export function editWebsite(id: string, website: Website) : Promise<Website> {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records/" + id, { method: "PATCH", headers: {"Content-Type": "application/json", "Accept": "application/json"}, body: JSON.stringify(website) });
    return fetch(request).then(response => {if(!response.ok) throw new Error("HTTP Error" + response.status); return response.json()});    
}

export function deleteWebsite(id: string) {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records/" + id, { method: "DELETE"});
    return fetch(request).then(response => {if(!response.ok) throw new Error("API HTTP Error " + response.status + " " + response.statusText)});
}


export function findWebsiteMany(query: WebsiteQueryParams) : Promise<WebsiteQueryResult> {
    const urlParams = new URLSearchParams();
    // Add all parameters to query string
    let param: keyof WebsiteQueryParams;
    for (param in query) {
        if (Object.prototype.hasOwnProperty.call(query, param)) {
            const paramValue = query[param];
            if(paramValue == null) {
                continue;
            }
            if(paramValue instanceof Array) {
                paramValue.forEach(item => urlParams.append(param, item));
            } else {
                urlParams.append(param, paramValue?.toString());
            }
            
        }
    }
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records?" + urlParams.toString(), { method: "GET" });
    return fetch(request).then(response => {
        if(!response.ok) {
            throw new Error("HTTP Error" + response.status);
        }
        return response.json().then(websites => {return {websites: websites}})
    });

}
