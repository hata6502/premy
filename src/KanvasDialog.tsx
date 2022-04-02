import { Dialog, StylesProvider } from "@material-ui/core";
import ScopedCssBaseline from "@material-ui/core/ScopedCssBaseline";
import ReactDOM from "react-dom";
import { App } from "./App";
import { KanvasThemeProvider } from "./KanvasThemeProvider";

export class KanvasDialog extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["open", "src"];
  }

  private appElement?: HTMLDivElement;
  private prevIsOpen: boolean = false;

  async attributeChangedCallback(): Promise<void> {
    const isOpen = this.isOpen();

    do {
      if (
        !this.prevIsOpen &&
        isOpen &&
        matchMedia("(orientation: portrait)").matches &&
        !confirm(
          "Your device is in portrait mode.\nWe recommend to use landscape mode.\n\nDo you want to continue?"
        )
      ) {
        this.removeAttribute("open");

        break;
      }

      this.render();
    } while (false);

    this.prevIsOpen = isOpen;
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
        "kanvas-pointer-listener-ignore",
        !this.isOpen()
      );
    }, 10);

    ReactDOM.render(
      <StylesProvider>
        <KanvasThemeProvider>
          <ScopedCssBaseline>
            <Dialog
              // To bubble events.
              disablePortal
              fullScreen
              // To keep <App> state.
              keepMounted
              open={this.isOpen()}
              onClose={this.handleClose}
            >
              <App
                src={this.getAttribute("src") ?? undefined}
                onCloseButtonClick={this.handleClose}
              />
            </Dialog>
          </ScopedCssBaseline>
        </KanvasThemeProvider>
      </StylesProvider>,
      this.appElement
    );
  }

  private isOpen() {
    return this.getAttribute("open") !== null;
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
