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

  /*shadow.innerHTML = `
      <style>
        #clipboard-error-snackbar {
          --mdc-snackbar-z-index: 2147483647;
        }

        #copied-to-clipboard-snackbar {
          --mdc-snackbar-z-index: 2147483647;
        }

        #dialog {
          --mdc-dialog-max-width: ${dialogMaxWidth}px;
          --mdc-dialog-z-index: 2147483646;
          user-select: none;
        }
      </style>
    `;

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
    */

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

  private handleClose = () => this.removeAttribute("open");

  /*private initializeBrushButton({
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
  }*/

  /*private handleBrushButtonClick({ brushType }: { brushType: BrushType }) {
    Object.values(this.brushButtons).forEach(
      (brushButton) => (brushButton.on = false)
    );

    this.brushButtons[brushType].on = true;
    this.canvas.setBrushType({ brushType });
    this.canvas.setMode({ mode: "shape" });
  }

  private handleColorButtonClick({ colorType }: { colorType: ColorType }) {
    Object.values(this.colorButtons).forEach(
      (colorButton) => (colorButton.on = false)
    );

    this.colorButtons[colorType].on = true;
    this.canvas.setColor({ color: colorType });
  }

  private handleToneButtonClick({ toneType }: { toneType: ToneType }) {
    Object.values(this.toneButtons).forEach(
      (toneButton) => (toneButton.on = false)
    );

    this.toneButtons[toneType].on = true;
    this.canvas.setToneType({ toneType });
  }

  */
}

customElements.define("kanvas-dialog", KanvasDialog);

export { KanvasDialog };
