import { Dialog } from "@material/mwc-dialog";
import "./KanvasCanvas";

const dialogMaxWidth = 1280;

// clear with color
// undo/redo
// 3 brushes
// 8 color
// 14 tone
// text
// I/O interface

class KanvasDialog extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

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
        <kanvas-canvas></kanvas-canvas>
      </mwc-dialog>
    `;

    const dialog = shadow.querySelector("#dialog");

    if (!(dialog instanceof Dialog)) {
      throw new Error("Element is not a canvas");
    }

    this.dialog = dialog;
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

  private handleClosed = () => {
    this.removeAttribute("open");
  };

  private handleOpening = () => {
    this.setAttribute("open", "");
  };
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog, dialogMaxWidth };
