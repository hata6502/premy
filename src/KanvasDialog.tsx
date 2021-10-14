import {
  CssBaseline,
  Dialog,
  StylesProvider,
  jssPreset,
} from "@material-ui/core";
import * as jss from "jss";
import ReactDOM from "react-dom";
import { App } from "./App";
import { KanvasThemeProvider } from "./KanvasThemeProvider";

class KanvasDialog extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["open", "src"];
  }

  private appElement;
  private containerElement;
  private createdJSS;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #container, #container * {
          touch-action: pinch-zoom;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      </style>

      <div>
        <noscript id="jss-insertion-point"></noscript>

        <div id="container">
          <div id="app"></div>
        </div>
      </div>
    `;

    const appElement = shadow.querySelector("#app");
    const containerElement = shadow.querySelector("#container");

    const jssInsertionPointElement = shadow.querySelector(
      "#jss-insertion-point"
    );

    if (
      !(appElement instanceof HTMLDivElement) ||
      !(containerElement instanceof HTMLDivElement) ||
      !(jssInsertionPointElement instanceof HTMLElement)
    ) {
      throw new Error("Could not find JSS insertion point.");
    }

    this.appElement = appElement;
    this.containerElement = containerElement;

    this.createdJSS = jss.create({
      ...jssPreset(),
      insertionPoint: jssInsertionPointElement,
    });

    this.render();
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private render() {
    ReactDOM.render(
      <StylesProvider jss={this.createdJSS}>
        <KanvasThemeProvider>
          <CssBaseline />

          <Dialog
            container={this.containerElement}
            disableEnforceFocus
            maxWidth="lg"
            open={this.getAttribute("open") !== null}
            onClose={this.handleClose}
          >
            <App
              container={this.containerElement}
              src={this.getAttribute("src") ?? undefined}
            />
          </Dialog>
        </KanvasThemeProvider>
      </StylesProvider>,
      this.appElement
    );
  }

  private handleClose = () => {
    const event = new CustomEvent("kanvasClose", {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  };
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog };
