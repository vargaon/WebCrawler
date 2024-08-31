import { Website } from "./website";

export interface Node {
    id: string,
    title?: string,
    url: string,
    crawlTime?: string,
    links: Node[],
    owner: Website,
    valid: boolean, // False means this url adress was not crawled because it doesn't match website recods boundary regex
}

const website_example_org : Website = {
    id: "0",
    label: "example.org",
    url: "http://www.example.org/",
    tags: [],
    regex: "http://www.example.org/.*",
    periodicity: {
        value: 1,
        unit: "day",
    },
    active: true,
}

const website_webik : Website = {
    id: "1",
    label: "MFF Webík",
    url: "https://webik.ms.mff.cuni.cz/",
    tags: [],
    regex: "https://webik.ms.mff.cuni.cz/.*",
    periodicity: {
        value: 7,
        unit: "day",
    },
    active: true,
}

const node_example_org_root : Node = {
    id: "0",
    title: "Example website",
    url: "http://www.example.org/",
    crawlTime: "2024-06-03T10:01:30.079Z",
    links: [],
    owner: website_example_org,
    valid: true, // False means this url adress was not crawled because it doesn't match website recods boundary regex
}

const node_example_org_page : Node = {
    id: "1",
    title: "Example page",
    url: "http://www.example.org/example",
    crawlTime: "2024-06-04T10:01:41.712Z",
    links: [],
    owner: website_example_org,
    valid: true, // False means this url adress was not crawled because it doesn't match website recods boundary regex
}

const node_webik_root : Node = {
    id: "2",
    title: "NSWI153 2023/2024",
    url: "https://webik.ms.mff.cuni.cz/",
    crawlTime: "2024-06-05T20:20:40.101Z",
    links: [],
    owner: website_webik,
    valid: true, // False means this url adress was not crawled because it doesn't match website recods boundary regex
}

const node_webik_webcrawler : Node = {
    id: "3",
    title: "WebCrawler",
    url: "https://webik.ms.mff.cuni.cz/seminar-project-webcrawler.html",
    crawlTime: "2024-06-05T20:20:40.101Z",
    links: [],
    owner: website_webik,
    valid: true, // False means this url adress was not crawled because it doesn't match website recods boundary regex
}

const node_webik_recodex_link : Node = {
    id: "4",
    url: "https://recodex.mff.cuni.cz",
    links: [],
    valid: false,
    owner: website_webik
}

const node_webik_example_link : Node = {
    id: "5",
    url: "http://www.example.org/",
    links: [],
    valid: false,
    owner: website_webik
}

// Build links
node_example_org_root.links.push(node_example_org_page);
node_webik_root.links.push(node_example_org_root);
node_webik_root.links.push(node_webik_webcrawler);
node_webik_root.links.push(node_webik_recodex_link);

export const mockNodes : Node[] = [
    node_example_org_root,
    node_example_org_page,
    node_webik_root,
    node_webik_webcrawler,
    node_webik_recodex_link,
    node_webik_example_link,
];