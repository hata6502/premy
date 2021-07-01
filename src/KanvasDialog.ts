import "@material/mwc-dialog";
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
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #dialog {
          --mdc-dialog-max-width: ${dialogMaxWidth}px;
        }
      </style>

      <mwc-dialog id="dialog" open>
        <kanvas-canvas></kanvas-canvas>
      </mwc-dialog>
    `;
  }
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog, dialogMaxWidth };
