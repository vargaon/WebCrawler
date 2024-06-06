import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Manage websites</h1>
      Here you can
      <ul>
        <li>
          <Link
            to="/website/create"
            rel="noreferrer"
          >
            Add new website to crawl
          </Link>
        </li>
        <li>TODO: Display website records (not implemented yet)</li>
      </ul>
      <p>
        Until view of all crawled websites with sorting and filtering features is implemented,
        look at <a href="/api/v1/website-records">API output here</a>.
      </p>
    </div>
  );
}
