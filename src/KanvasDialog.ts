import { Dialog } from "@material/mwc-dialog";
import { IconButton } from "@material/mwc-icon-button";
import { KanvasCanvas } from "./KanvasCanvas";
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";

const dialogMaxWidth = 1280;

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
  private redoButton;
  private undoButton;

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

          <mwc-icon-button id="undo-button" disabled>
            <span style="font-size: 20px;">↩</span>
          </mwc-icon-button>

          <mwc-icon-button id="redo-button" disabled>
            <span style="font-size: 20px;">↪</span>
          </mwc-icon-button>
        </div>
      </mwc-dialog>
    `;

    const canvas = shadow.querySelector("#canvas");
    const clearButton = shadow.querySelector("#clear-button");
    const dialog = shadow.querySelector("#dialog");
    const redoButton = shadow.querySelector("#redo-button");
    const undoButton = shadow.querySelector("#undo-button");

    if (
      !(canvas instanceof KanvasCanvas) ||
      !(clearButton instanceof IconButton) ||
      !(dialog instanceof Dialog) ||
      !(redoButton instanceof IconButton) ||
      !(undoButton instanceof IconButton)
    ) {
      throw new Error("One or more of the elements is not a valid child");
    }

    this.canvas = canvas;
    this.dialog = dialog;
    this.redoButton = redoButton;
    this.undoButton = undoButton;

    this.dialog.addEventListener("closed", this.handleClosed);
    this.dialog.addEventListener("opening", this.handleOpening);

    this.canvas.addEventListener(
      "kanvasHistoryChange",
      this.handleCanvasHistoryChange
    );

    clearButton.addEventListener("click", this.handleClearButtonClick);
    this.undoButton.addEventListener("click", this.handleUndoButtonClick);
    this.redoButton.addEventListener("click", this.handleRedoButtonClick);
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

  private handleClosed = () => this.removeAttribute("open");
  private handleOpening = () => this.setAttribute("open", "");

  private handleCanvasHistoryChange = (event: KanvasHistoryChangeEvent) => {
    this.undoButton.disabled = !event.detail.isUndoable;
    this.redoButton.disabled = !event.detail.isRedoable;
  };

  private handleClearButtonClick = () => this.canvas.clear();
  private handleUndoButtonClick = () => this.canvas.undo();
  private handleRedoButtonClick = () => this.canvas.redo();
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog, dialogMaxWidth };
