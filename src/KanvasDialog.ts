import { Dialog } from "@material/mwc-dialog";
import { IconButton } from "@material/mwc-icon-button";
import { IconButtonToggle } from "@material/mwc-icon-button-toggle";
import { KanvasCanvas } from "./KanvasCanvas";
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import editSVG from "./edit_black_24dp.svg";
import insertDriveFileSVG from "./insert_drive_file_black_24dp.svg";
import redoSVG from "./redo_black_24dp.svg";
import undoSVG from "./undo_black_24dp.svg";

const dialogMaxWidth = 1280;

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

  private brushButton: Record<BrushType, IconButtonToggle>;
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
          user-select: none;
          --mdc-dialog-max-width: ${dialogMaxWidth}px;
          --mdc-dialog-z-index: 2147483647;
        }

        #redo-button[disabled], #undo-button[disabled] {
          opacity: 0.4;
        }
      </style>

      <mwc-dialog id="dialog" hideActions>
        <kanvas-canvas id="canvas"></kanvas-canvas>

        <div>
          <mwc-icon-button id="clear-button">
            <img src="${insertDriveFileSVG}" />
          </mwc-icon-button>

          <mwc-icon-button id="undo-button" disabled>
            <img src="${undoSVG}" />
          </mwc-icon-button>

          <mwc-icon-button id="redo-button" disabled>
            <img src="${redoSVG}" />
          </mwc-icon-button>

          ${Object.values(brushes)
            .map(
              (brush) => `
            <style>
              #${brush.button.id} {
                opacity: 0.4;
                --mdc-icon-size: ${brush.button.size}px;
              }

              #${brush.button.id}[on] {
                opacity: 1;
              }
            </style>

            <mwc-icon-button-toggle id="${brush.button.id}">
              <img slot="onIcon" src="${editSVG}" />
              <img slot="offIcon" src="${editSVG}" />
            </mwc-icon-button-toggle>
          `
            )
            .join("")}
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

    this.brushButton = {
      light: this.initializeBrushButton({
        brushType: "light",
        on: true,
        shadow,
      }),
      medium: this.initializeBrushButton({
        brushType: "medium",
        on: false,
        shadow,
      }),
      bold: this.initializeBrushButton({
        brushType: "bold",
        on: false,
        shadow,
      }),
    };
  }

  attributeChangedCallback() {
    this.handleAttributeChange();
  }

  connectedCallback() {
    this.handleAttributeChange();
  }

  private initializeBrushButton({
    brushType,
    on,
    shadow,
  }: {
    brushType: BrushType;
    on: boolean;
    shadow: ShadowRoot;
  }) {
    const brush = brushes[brushType];
    const button = shadow.querySelector(`#${brush.button.id}`);

    if (!(button instanceof IconButtonToggle)) {
      throw new Error(`${brush.button.id} is not a valid child`);
    }

    button.on = on;
    button.addEventListener("click", () =>
      this.handleBrushButtonClick({ brushType })
    );

    return button;
  }

  private handleAttributeChange() {
    this.dialog.open = this.getAttribute("open") !== null;
  }

  private handleBrushButtonClick({ brushType }: { brushType: BrushType }) {
    Object.values(this.brushButton).forEach((value) => (value.on = false));
    this.brushButton[brushType].on = true;
    this.canvas.setBrushType({ brushType });
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
