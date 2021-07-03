import { Dialog } from "@material/mwc-dialog";
import { IconButton } from "@material/mwc-icon-button";
import { KanvasCanvas } from "./KanvasCanvas";

const dialogMaxWidth = 1280;

// clear with color
// undo/redo
// 3 brushes
// 8 color
// 14 tone
// text
// I/O interface
//   load
//   save

class KanvasDialog extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

  private canvas;
  private dialog;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #dialog {
          --mdc-dialog-max-width: ${dialogMaxWidth}px;
        }
      </style>

      <mwc-dialog id="dialog">
        <kanvas-canvas id="canvas"></kanvas-canvas>

        <div slot="primaryAction">
          <mwc-icon-button id="clear-button">
            <span style="font-size: 20px;">📄</span>
          </mwc-icon-button>

          <mwc-icon-button>
            <span style="font-size: 20px;">↩</span>
          </mwc-icon-button>

          <mwc-icon-button>
            <span style="font-size: 20px;">↪</span>
          </mwc-icon-button>
        </div>
      </mwc-dialog>
    `;

    const canvas = shadow.querySelector("#canvas");
    const clearButton = shadow.querySelector("#clear-button");
    const dialog = shadow.querySelector("#dialog");

    if (
      !(canvas instanceof KanvasCanvas) ||
      !(clearButton instanceof IconButton) ||
      !(dialog instanceof Dialog)
    ) {
      throw new Error("Could not find dialog or icon button");
    }

    this.canvas = canvas;
    this.dialog = dialog;

    clearButton.addEventListener("click", this.handleClearButtonClick);

    this.dialog.addEventListener("closed", this.handleClosed);
    this.dialog.addEventListener("opening", this.handleOpening);
  }

  attributeChangedCallback() {
    this.handleAttributeChange();
  }

  connectedCallback() {
    this.handleAttributeChange();
  }

  private handleAttributeChange() {
    this.dialog.open = this.getAttribute("open") !== null;
  }

  private handleClearButtonClick = () => {
    this.canvas.clear();
  };

  private handleClosed = () => {
    this.removeAttribute("open");
  };

  private handleOpening = () => {
    this.setAttribute("open", "");
  };
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog, dialogMaxWidth };
