import { Dialog } from "@material/mwc-dialog";
import { IconButton } from "@material/mwc-icon-button";
import { IconButtonToggle } from "@material/mwc-icon-button-toggle";
import { Snackbar } from "@material/mwc-snackbar";
import { TextField } from "@material/mwc-textfield";
import { KanvasCanvas } from "./KanvasCanvas";
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import { colors } from "./colors";
import type { ColorType } from "./colors";
import contentPasteSVG from "./content_paste_black_24dp.svg";
import editSVG from "./edit_black_24dp.svg";
import folderOpenSVG from "./folder_open_black_24dp.svg";
import insertDriveFileSVG from "./insert_drive_file_black_24dp.svg";
import redoSVG from "./redo_black_24dp.svg";
import saveSVG from "./save_black_24dp.svg";
import { tones } from "./tones";
import type { ToneType } from "./tones";
import undoSVG from "./undo_black_24dp.svg";

const dialogMaxWidth = 1280;

class KanvasDialog extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["open", "src"];
  }

  private brushButtons: Record<BrushType, IconButtonToggle>;
  private canvas;
  private clipboardErrorSnackbar;
  private copiedToClipboardSnackbar;
  private colorButtons: Record<ColorType, IconButtonToggle>;
  private dialog;
  private fileInput;
  private redoButton;
  private textInput;
  private toneButtons: Record<ToneType, IconButtonToggle>;
  private undoButton;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host {
          --mdc-theme-primary: #ffc107;
          --mdc-theme-secondary: #651fff;
        }

        #action-container {
          display: flex;
          position: sticky;
          bottom: 0;
          align-items: center;
          background-color: #ffffff;
          overflow: auto;
          padding-top: 8px;
          width: calc(min(var(--mdc-dialog-max-width), 100vw) - 96px);
        }

        #container {
          display: flex;
          align-items: center;
          flex-direction: column;
        }

        #dialog {
          --mdc-dialog-max-width: ${dialogMaxWidth}px;
          --mdc-dialog-z-index: 2147483647;

          user-select: none;
        }

        #file-input {
          display: none;
        }

        #redo-button[disabled], #undo-button[disabled] {
          opacity: 0.4;
        }

        #text-input {
          min-width: 212px;
        }

        .divider {
          min-width: 16px;
        }
      </style>

      <mwc-dialog id="dialog" hideActions>
        <div id="container">
          <kanvas-canvas id="canvas"></kanvas-canvas>

          <div id="action-container">
            <mwc-icon-button id="clear-button" title="clear">
              <img src="${insertDriveFileSVG}" />
            </mwc-icon-button>

            <div class="divider"></div>

            <mwc-icon-button id="undo-button" disabled title="undo">
              <img src="${undoSVG}" />
            </mwc-icon-button>

            <mwc-icon-button id="redo-button" disabled title="redo">
              <img src="${redoSVG}" />
            </mwc-icon-button>

            <div class="divider"></div>

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

            <div class="divider"></div>

            <mwc-textfield
              id="text-input"
              outlined
              label="Text"
            ></mwc-textfield>

            <div class="divider"></div>

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

            <div class="divider"></div>

            ${Object.values(tones)
              .map(
                (tone) => `
                  <style>
                    #${tone.button.id}[on] {
                      background-color: rgba(0, 0, 0, 0.07);
                      border-radius: 50%;
                    }
                  </style>

                  <mwc-icon-button-toggle id="${tone.button.id}">
                    <img slot="onIcon" src="${tone.button.image}" />
                    <img slot="offIcon" src="${tone.button.image}" />
                  </mwc-icon-button-toggle>
                `
              )
              .join("")}

            <div class="divider"></div>

            <mwc-icon-button id="open-button" title="open">
              <img src="${folderOpenSVG}" />
            </mwc-icon-button>

            <input id="file-input" type="file" accept="image/*" />

            <mwc-icon-button id="save-button" title="save" >
              <img src="${saveSVG}" />
            </mwc-icon-button>

            <mwc-icon-button
              id="copy-to-clipboard-button"
              title="copy to clipboard"
            >
              <img src="${contentPasteSVG}" />
            </mwc-icon-button>
          </div>
        </div>
      </mwc-dialog>

      <mwc-snackbar
        id="copied-to-clipboard-snackbar"
        labelText="Copied to clipboard."
      ></mwc-snackbar>

      <mwc-snackbar
        id="clipboard-error-snackbar"
        labelText="Failed to copy to clipboard."
      ></mwc-snackbar>
    `;

    const canvas = shadow.querySelector("#canvas");
    const clearButton = shadow.querySelector("#clear-button");

    const clipboardErrorSnackbar = shadow.querySelector(
      "#clipboard-error-snackbar"
    );

    const copiedToClipboardSnackbar = shadow.querySelector(
      "#copied-to-clipboard-snackbar"
    );

    const copyToClipboardButton = shadow.querySelector(
      "#copy-to-clipboard-button"
    );

    const dialog = shadow.querySelector("#dialog");
    const fileInput = shadow.querySelector("#file-input");
    const openButton = shadow.querySelector("#open-button");
    const redoButton = shadow.querySelector("#redo-button");
    const saveButton = shadow.querySelector("#save-button");
    const textInput = shadow.querySelector("#text-input");
    const undoButton = shadow.querySelector("#undo-button");

    if (
      !(canvas instanceof KanvasCanvas) ||
      !(clearButton instanceof IconButton) ||
      !(clipboardErrorSnackbar instanceof Snackbar) ||
      !(copiedToClipboardSnackbar instanceof Snackbar) ||
      !(copyToClipboardButton instanceof IconButton) ||
      !(dialog instanceof Dialog) ||
      !(fileInput instanceof HTMLInputElement) ||
      !(openButton instanceof IconButton) ||
      !(redoButton instanceof IconButton) ||
      !(saveButton instanceof IconButton) ||
      !(textInput instanceof TextField) ||
      !(undoButton instanceof IconButton)
    ) {
      throw new Error("One or more of the elements is not a valid child");
    }

    this.canvas = canvas;
    this.clipboardErrorSnackbar = clipboardErrorSnackbar;
    this.copiedToClipboardSnackbar = copiedToClipboardSnackbar;
    this.dialog = dialog;
    this.fileInput = fileInput;
    this.redoButton = redoButton;
    this.textInput = textInput;
    this.undoButton = undoButton;

    this.dialog.addEventListener("closed", this.handleClosed);
    this.dialog.addEventListener("opening", this.handleOpening);

    this.canvas.addEventListener(
      "kanvasHistoryChange",
      this.handleCanvasHistoryChange
    );

    clearButton.addEventListener("click", this.handleClearButtonClick);
    this.redoButton.addEventListener("click", this.handleRedoButtonClick);
    this.undoButton.addEventListener("click", this.handleUndoButtonClick);

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

    this.toneButtons = {
      fill: this.initializeToneButton({
        toneType: "fill",
        on: true,
        shadow,
      }),
      dotLight: this.initializeToneButton({
        toneType: "dotLight",
        on: false,
        shadow,
      }),
      dotMedium: this.initializeToneButton({
        toneType: "dotMedium",
        on: false,
        shadow,
      }),
      dotBold: this.initializeToneButton({
        toneType: "dotBold",
        on: false,
        shadow,
      }),
      horizontalLight: this.initializeToneButton({
        toneType: "horizontalLight",
        on: false,
        shadow,
      }),
      horizontalMedium: this.initializeToneButton({
        toneType: "horizontalMedium",
        on: false,
        shadow,
      }),
      horizontalBold: this.initializeToneButton({
        toneType: "horizontalBold",
        on: false,
        shadow,
      }),
      verticalLight: this.initializeToneButton({
        toneType: "verticalLight",
        on: false,
        shadow,
      }),
      verticalMedium: this.initializeToneButton({
        toneType: "verticalMedium",
        on: false,
        shadow,
      }),
      verticalBold: this.initializeToneButton({
        toneType: "verticalBold",
        on: false,
        shadow,
      }),
      slashLight: this.initializeToneButton({
        toneType: "slashLight",
        on: false,
        shadow,
      }),
      slashBold: this.initializeToneButton({
        toneType: "slashBold",
        on: false,
        shadow,
      }),
      backslashLight: this.initializeToneButton({
        toneType: "backslashLight",
        on: false,
        shadow,
      }),
      backslashBold: this.initializeToneButton({
        toneType: "backslashBold",
        on: false,
        shadow,
      }),
    };

    this.textInput.addEventListener("focus", this.handleTextInputFocus);
    this.textInput.addEventListener("input", this.handleTextInputInput);

    openButton.addEventListener("click", this.handleOpenButtonClick);
    this.fileInput.addEventListener("change", this.handleFileInputChange);

    saveButton.addEventListener("click", this.handleSaveButtonClick);

    copyToClipboardButton.addEventListener(
      "click",
      this.handleCopyToClipboardButtonClick
    );
  }

  async attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): Promise<void> {
    await this.handleAttributeChange({ name, oldValue, newValue });
  }

  async connectedCallback(): Promise<void> {
    await this.handleAttributeChange({});
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

  private initializeToneButton({
    toneType,
    on,
    shadow,
  }: {
    toneType: ToneType;
    on: boolean;
    shadow: ShadowRoot;
  }) {
    const tone = tones[toneType];
    const button = shadow.querySelector(`#${tone.button.id}`);

    if (!(button instanceof IconButtonToggle)) {
      throw new Error(`${tone.button.id} is not a valid child`);
    }

    button.on = on;

    button.addEventListener("click", () =>
      this.handleToneButtonClick({ toneType })
    );

    return button;
  }

  private async handleAttributeChange({
    name,
    newValue,
  }: {
    name?: string;
    oldValue?: string | null;
    newValue?: string | null;
  }) {
    this.dialog.open = this.getAttribute("open") !== null;

    if (name === "src" && newValue) {
      await this.canvas.load({ src: newValue });
    }
  }

  private handleBrushButtonClick({ brushType }: { brushType: BrushType }) {
    Object.values(this.brushButtons).forEach(
      (brushButton) => (brushButton.on = false)
    );

    this.brushButtons[brushType].on = true;
    this.canvas.setBrushType({ brushType });
    this.canvas.setMode({ mode: "shape" });
  }

  private handleClosed = () => {
    this.canvas.setIsEnabled({ isEnabled: false });
    this.removeAttribute("open");
  };

  private handleColorButtonClick({ colorType }: { colorType: ColorType }) {
    Object.values(this.colorButtons).forEach(
      (colorButton) => (colorButton.on = false)
    );

    this.colorButtons[colorType].on = true;
    this.canvas.setColor({ color: colorType });
  }

  private handleCanvasHistoryChange = (event: KanvasHistoryChangeEvent) => {
    this.redoButton.disabled =
      event.detail.historyIndex >= event.detail.history.length - 1;

    this.undoButton.disabled = event.detail.historyIndex < 1;
  };

  private handleClearButtonClick = () => this.canvas.clear();

  private handleCopyToClipboardButtonClick = () =>
    this.canvas.toBlob(
      (blob) =>
        void (async () => {
          try {
            if (!blob) {
              throw new Error("Blob is null");
            }

            // @ts-expect-error ClipboardItem is not defined.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const data = [new ClipboardItem({ [blob.type]: blob })];

            // @ts-expect-error Clipboard.write() is not defined.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await navigator.clipboard.write(data);
            this.copiedToClipboardSnackbar.show();
          } catch (exception: unknown) {
            this.clipboardErrorSnackbar.show();

            throw exception;
          }
        })()
    );

  private handleFileInputChange = () => {
    const file = this.fileInput.files?.[0];

    if (!file) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.addEventListener(
      "load",
      () =>
        void (async () => {
          const src = fileReader.result;

          if (typeof src !== "string") {
            throw new Error("Source is not a string");
          }

          await this.canvas.load({ src });
        })()
    );

    fileReader.readAsDataURL(file);
  };

  private handleOpenButtonClick = () => this.fileInput.click();

  private handleOpening = () => {
    this.canvas.setIsEnabled({ isEnabled: true });
    this.setAttribute("open", "");
  };

  private handleRedoButtonClick = () => this.canvas.redo();

  private handleSaveButtonClick = () => {
    const anchorElement = document.createElement("a");

    try {
      anchorElement.download = "sketch.png";
      anchorElement.href = this.canvas.toDataURL("image/png");
      document.body.append(anchorElement);
      anchorElement.click();
    } finally {
      anchorElement.remove();
    }
  };

  private handleTextInputFocus = () => this.canvas.setMode({ mode: "text" });

  private handleTextInputInput = () =>
    this.canvas.setText({ text: this.textInput.value });

  private handleToneButtonClick({ toneType }: { toneType: ToneType }) {
    Object.values(this.toneButtons).forEach(
      (toneButton) => (toneButton.on = false)
    );

    this.toneButtons[toneType].on = true;
    this.canvas.setToneType({ toneType });
  }

  private handleUndoButtonClick = () => this.canvas.undo();
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog, dialogMaxWidth };
