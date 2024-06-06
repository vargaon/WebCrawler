import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export default function Index() {
  return (
    <div className="row align-items-center" style={{ height: "50vh", fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="col-1 d-flex justify-content-center mx-auto">
        <h1>WebCrawler</h1>
      </div>
    </div>
  );
}