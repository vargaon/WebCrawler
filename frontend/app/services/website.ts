import { PUBLIC_API_BASE } from "./config";

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

}

export function createWebsite(website: Website) : Promise<Website> {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records", { method: "POST", headers: {"Content-Type": "application/json", "Accept": "application/json"}, body: JSON.stringify(website) });
    return fetch(request).then(response => {if(response.status != 201) throw new Error("HTTP Error " + response.status + " " + response.statusText + " from API"); return response.json()});
}

export function getWebsite(id: string) : Promise<Website> {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records/" + id, { method: "GET" });
    return fetch(request).then(response => {if(!response.ok) throw new Error("HTTP Error " + response.status + " " + response.statusText + " from API"); return response.json()});    
}

export function editWebsite(id: string, website: Website) : Promise<Website> {
    const request = new Request(PUBLIC_API_BASE + "api/v1/website-records/" + id, { method: "PATCH", headers: {"Content-Type": "application/json", "Accept": "application/json"}, body: JSON.stringify(website) });
    return fetch(request).then(response => {if(!response.ok) throw new Error("HTTP Error " + response.status + " " + response.statusText + " from API"); return response.json()});    
}


// export function findWebsiteMany(query: websitequeryparams) {
//    return null;
//}
