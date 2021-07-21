import { Dialog } from "@material/mwc-dialog";
import { IconButton } from "@material/mwc-icon-button";
import { IconButtonToggle } from "@material/mwc-icon-button-toggle";
import { KanvasCanvas } from "./KanvasCanvas";
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import { colors } from "./colors";
import type { ColorType } from "./colors";
import editSVG from "./edit_black_24dp.svg";
import insertDriveFileSVG from "./insert_drive_file_black_24dp.svg";
import redoSVG from "./redo_black_24dp.svg";
import undoSVG from "./undo_black_24dp.svg";

const dialogMaxWidth = 1280;

// text
// 14 tone
// copy to clipboard
// paste from clipboard
// load
// save
// through history event
// dialog event
// publish to npm

class KanvasDialog extends HTMLElement {
  static get observedAttributes() {
    return ["open"];
  }

  private brushButtons: Record<BrushType, IconButtonToggle>;
  private colorButtons: Record<ColorType, IconButtonToggle>;
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
                    --mdc-icon-size: ${brush.button.size}px;
                  }

                  #${brush.button.id}[on] {
                    background-color: rgba(0, 0, 0, 0.07);
                    border-radius: 50%;
                  }
                </style>

                <mwc-icon-button-toggle id="${brush.button.id}">
                  <img slot="onIcon" src="${editSVG}" />
                  <img slot="offIcon" src="${editSVG}" />
                </mwc-icon-button-toggle>
              `
            )
            .join("")}

            ${Object.values(colors)
              .map(
                (color) => `
                  <style>
                    #${color.button.id}[on] {
                      background-color: rgba(0, 0, 0, 0.07);
                      border-radius: 50%;
                    }
                  </style>

                  <mwc-icon-button-toggle id="${color.button.id}">
                    <img slot="onIcon" src="${color.button.image}" />
                    <img slot="offIcon" src="${color.button.image}" />
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

    this.brushButtons = {
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

    this.colorButtons = {
      "#000000": this.initializeColorButton({
        colorType: "#000000",
        on: true,
        shadow,
      }),
      "#ff0000": this.initializeColorButton({
        colorType: "#ff0000",
        on: false,
        shadow,
      }),
      "#00ff00": this.initializeColorButton({
        colorType: "#00ff00",
        on: false,
        shadow,
      }),
      "#0000ff": this.initializeColorButton({
        colorType: "#0000ff",
        on: false,
        shadow,
      }),
      "#ffff00": this.initializeColorButton({
        colorType: "#ffff00",
        on: false,
        shadow,
      }),
      "#ff00ff": this.initializeColorButton({
        colorType: "#ff00ff",
        on: false,
        shadow,
      }),
      "#00ffff": this.initializeColorButton({
        colorType: "#00ffff",
        on: false,
        shadow,
      }),
      "#ffffff": this.initializeColorButton({
        colorType: "#ffffff",
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

  private initializeColorButton({
    colorType,
    on,
    shadow,
  }: {
    colorType: ColorType;
    on: boolean;
    shadow: ShadowRoot;
  }) {
    const color = colors[colorType];
    const button = shadow.querySelector(`#${color.button.id}`);

    if (!(button instanceof IconButtonToggle)) {
      throw new Error(`${color.button.id} is not a valid child`);
    }

    button.on = on;

    button.addEventListener("click", () =>
      this.handleColorButtonClick({ colorType })
    );

    return button;
  }

  private handleAttributeChange() {
    this.dialog.open = this.getAttribute("open") !== null;
  }

  private handleBrushButtonClick({ brushType }: { brushType: BrushType }) {
    Object.values(this.brushButtons).forEach(
      (brushButton) => (brushButton.on = false)
    );

    this.brushButtons[brushType].on = true;
    this.canvas.setBrushType({ brushType });
  }

  private handleColorButtonClick({ colorType }: { colorType: ColorType }) {
    Object.values(this.colorButtons).forEach(
      (colorButton) => (colorButton.on = false)
    );

    this.colorButtons[colorType].on = true;
    this.canvas.setColor({ color: colorType });
  }

  private handleClosed = () => this.removeAttribute("open");
  private handleOpening = () => this.setAttribute("open", "");

  private handleCanvasHistoryChange = (event: KanvasHistoryChangeEvent) => {
    this.undoButton.disabled = !event.detail.isUndoable;
    this.redoButton.disabled = !event.detail.isRedoable;
  };

  private handleClearButtonClick = () =>
    this.canvas.clear({ color: this.canvas.getColor() });

  private handleUndoButtonClick = () => this.canvas.undo();
  private handleRedoButtonClick = () => this.canvas.redo();
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog, dialogMaxWidth };
