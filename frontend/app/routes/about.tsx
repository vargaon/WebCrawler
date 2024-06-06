import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix SPA" },
    { name: "description", content: "Welcome to Remix (SPA Mode)!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix app (SPA Mode)</h1>
      <ul>
        <li><a href="/api">Swagger UI</a></li>
        <li><a href="https://webik.ms.mff.cuni.cz/nswi153/seminar-project-webcrawler.html">Semninar project specification</a></li>
        <li>
          <a
            target="_blank"
            href="https://remix.run/guides/spa-mode"
            rel="noreferrer"
          >
            SPA Mode Guide
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
        <li>
          <a
            target="_blank"
            href="https://getbootstrap.com/docs/5.3/getting-started/introduction/"
            rel="noreferrer"
          >
            Bootstrap docs
          </a>
        </li>
      </ul>
    </div>
  );
}
