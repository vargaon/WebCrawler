import { render } from "preact";
import { App } from "./app.tsx";
import "./scss/custom.scss";

render(<App />, document.getElementById("app")!);
