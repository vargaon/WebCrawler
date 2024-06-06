import { LinksFunction } from "@remix-run/node";
import {
  Link,
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Container, Nav } from "react-bootstrap";
import bootstrapCSS from "bootstrap/dist/css/bootstrap.css?url";
/*eslint import/no-unresolved: [0, { ignore: ["^~/"] }]*/
import customCSS from "~/src/custom.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: bootstrapCSS },
  { rel: "stylesheet", href: customCSS },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="navbar" style={{"backgroundImage": "linear-gradient(to bottom right, #FE0D0D, #900909, #FE0D0D)"}} data-bs-theme="dark">
          <div className="navbar-nav">
            <Container>
              <Nav className="">
                <Link to="/" className="navbar-brand">WebCrawler</Link>
                <NavLink to="/website" className="nav-link active">Websites</NavLink>
                <NavLink to="/execution" className="nav-link active">Executions</NavLink>
                <NavLink to="/about" className="nav-link active">About</NavLink>
              </Nav>
            </Container>
          </div>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Container fluid="md"><Outlet /></Container>;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
