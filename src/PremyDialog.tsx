import { Dialog, StylesProvider } from "@material-ui/core";
import ScopedCssBaseline from "@material-ui/core/ScopedCssBaseline";
import ReactDOM from "react-dom";
import { App } from "./App";
import { PremyThemeProvider } from "./PremyThemeProvider";

export class PremyDialog extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["open", "src"];
  }

  private appElement?: HTMLDivElement;
  private prevIsOpen = false;

  attributeChangedCallback(): void {
    if (
      !this.prevIsOpen &&
      this.isOpen() &&
      matchMedia("(orientation: portrait)").matches &&
      !window.confirm(
        "Your device is in portrait mode.\nWe recommend to use landscape mode.\n\nDo you want to continue?"
      )
    ) {
      this.removeAttribute("open");
    }

    this.render();
    this.prevIsOpen = this.isOpen();
  }

  connectedCallback(): void {
    this.innerHTML = `
      <div class="app"></div>
    `;

    const appElement = this.querySelector(".app");

    if (!(appElement instanceof HTMLDivElement)) {
      throw new Error("Invalid element.");
    }

    this.appElement = appElement;
    this.render();
  }

  private render() {
    if (!this.appElement) {
      return;
    }

    // https://developer.mozilla.org/ja/docs/Web/API/touchevent#using_with_addeventlistener_and_preventdefault
    setTimeout(() => {
      document.body.classList.toggle(
        "premy-pointer-listener-ignore",
        !this.isOpen()
      );
    }, 10);

    ReactDOM.render(
      <StylesProvider>
        <PremyThemeProvider>
          <ScopedCssBaseline>
            <Dialog
              // canvasのサイズを計算するために必要。
              className="premy-dialog-root"
              // To bubble events.
              disablePortal
              fullScreen
              open={this.isOpen()}
              onClose={this.handleClose}
            >
              <App
                src={this.getAttribute("src") ?? undefined}
                onCloseButtonClick={this.handleClose}
              />
            </Dialog>
          </ScopedCssBaseline>
        </PremyThemeProvider>
      </StylesProvider>,
      this.appElement
    );
  }

  private isOpen() {
    return this.getAttribute("open") !== null;
  }

  private handleClose = () => {
    const event = new CustomEvent("premyClose", {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  };
}

customElements.define("premy-dialog", PremyDialog);
