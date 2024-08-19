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
import type { NavLinkRenderProps } from "react-router-dom";
import { Container, Nav } from "react-bootstrap";
import bootstrapCSS from "bootstrap/dist/css/bootstrap.css?url";
/*eslint import/no-unresolved: [0, { ignore: ["^~/"] }]*/
import customCSS from "~/src/custom.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: bootstrapCSS },
  { rel: "stylesheet", href: customCSS },
]

function navLinkClassNameCallback({isActive} : NavLinkRenderProps) {
  const classes = ["nav-link", "active"];
  if(isActive) {
    classes.push("text-decoration-underline");
  }
  return classes.join(" ");
}

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
                <NavLink to="/websites" className={navLinkClassNameCallback}>Websites</NavLink>
                <NavLink to="/executions" className={navLinkClassNameCallback}>Executions</NavLink>
                <NavLink to="/about" className={navLinkClassNameCallback}>About</NavLink>
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
