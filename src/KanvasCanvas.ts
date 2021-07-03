import "@material/mwc-dialog";
import { dialogMaxWidth } from "./KanvasDialog";

const canvasHeight = 180;
const canvasWidth = 320;

const historyMaxLength = 30;

const brush = {
  light: [[1]],
  medium: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  bold: [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
  ],
};

const tone = {
  fill: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  dotLight: [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  dotMedium: [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
  ],
  dotBold: [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  verticalLight: [
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
  ],
  verticalMedium: [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
  ],
  verticalBold: [
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
  ],
  horizontalLight: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  horizontalMedium: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  horizontalBold: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  slashLight: [
    [0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
  ],
  slashBold: [
    [1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
  ],
  backslashLight: [
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1],
  ],
  backslashBold: [
    [0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0],
  ],
};

declare global {
  interface HTMLElementEventMap {
    kanvasHistoryChange: KanvasHistoryChangeEvent;
  }
}

type KanvasHistoryChangeEvent = CustomEvent<{
  isRedoable: boolean;
  isUndoable: boolean;
}>;

interface Position {
  x: number;
  y: number;
}

class KanvasCanvas extends HTMLElement {
  private canvas;
  private zoom;

  private history: string[];
  private historyIndex: number;
  private prevCanvasPosition: Position;

  constructor() {
    super();

    this.history = [];
    this.historyIndex = -1;
    this.prevCanvasPosition = { x: 0, y: 0 };

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <canvas
        id="canvas"
        style="border: 1px solid #d3d3d3;"
      ></canvas>
    `;

    const canvas = shadow.querySelector("#canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("Element is not a canvas");
    }

    this.canvas = canvas;

    const heightZoom = (window.innerHeight - 128) / canvasHeight;
    const widthZoom =
      (Math.min(window.innerWidth, dialogMaxWidth) - 96) / canvasWidth;

    this.zoom = Math.min(heightZoom, widthZoom);

    this.canvas.height = canvasHeight * this.zoom;
    this.canvas.width = canvasWidth * this.zoom;
    this.clear();
  }

  clear() {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.pushHistory();
  }

  undo() {
    if (this.historyIndex < 1) {
      return;
    }

    this.historyIndex--;
    this.putHistory();
    this.dispatchChangeHistoryEvent();
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) {
      return;
    }

    this.historyIndex++;
    this.putHistory();
    this.dispatchChangeHistoryEvent();
  }

  private getCanvasPosition(clientPosition: Position): Position {
    const domRect = this.canvas.getBoundingClientRect();
    const pixelX = clientPosition.x - (domRect.left + 1);
    const pixelY = clientPosition.y - (domRect.top + 1);

    return {
      x: Math.round(pixelX / this.zoom),
      y: Math.round(pixelY / this.zoom),
    };
  }

  adoptedCallback(oldDocument: Document, newDocument: Document) {
    this.handleDisconnected({ document: oldDocument });
    this.handleConnected({ document: newDocument });
  }

  connectedCallback() {
    this.handleConnected({ document });
  }

  disconnectedCallback() {
    this.handleDisconnected({ document });
  }

  private dispatchChangeHistoryEvent() {
    const event: KanvasHistoryChangeEvent = new CustomEvent(
      "kanvasHistoryChange",
      {
        detail: {
          isRedoable: this.historyIndex < this.history.length - 1,
          isUndoable: this.historyIndex >= 1,
        },
      }
    );

    this.dispatchEvent(event);
  }

  private drawLine({ from, to }: { from: Position; to: Position }) {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    const stepLength = Math.max(
      Math.round(
        Math.sqrt(Math.pow(to.x - from.x, 2.0) + Math.pow(to.y - from.y, 2.0))
      ),
      1
    );

    context.fillStyle = "#000000";

    [...Array(stepLength).keys()].forEach((step) => {
      const distance = step / stepLength;
      const x = from.x + Math.round((to.x - from.x) * distance);
      const y = from.y + Math.round((to.y - from.y) * distance);

      context.fillRect(x * this.zoom, y * this.zoom, this.zoom, this.zoom);
    });
  }

  private pushHistory() {
    const dataURL = this.canvas.toDataURL();

    if (this.historyIndex >= 0 && this.history[this.historyIndex] === dataURL) {
      return;
    }

    this.history = [
      ...this.history.slice(
        Math.max(this.historyIndex - historyMaxLength, 0),
        this.historyIndex + 1
      ),
      dataURL,
    ];

    this.historyIndex = this.history.length - 1;
    this.dispatchChangeHistoryEvent();
  }

  private putHistory() {
    const context = this.canvas.getContext("2d");
    const image = new Image();

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    image.onload = () => context.drawImage(image, 0, 0);
    image.src = this.history[this.historyIndex];
  }

  private handleConnected({ document }: { document: Document }) {
    document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUp);

    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchend", this.handleTouchEnd);
  }

  private handleDisconnected({ document }: { document: Document }) {
    document.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
  }

  private handleDown(clientPosition: Position) {
    if (this.canvas.offsetParent === null) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(clientPosition);

    this.drawLine({
      from: canvasPosition,
      to: canvasPosition,
    });

    this.prevCanvasPosition = canvasPosition;
  }

  private handleMove(clientPosition: Position) {
    if (this.canvas.offsetParent === null) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(clientPosition);

    this.drawLine({
      from: this.prevCanvasPosition,
      to: canvasPosition,
    });

    this.prevCanvasPosition = canvasPosition;
  }

  private handleUp(clientPosition: Position) {
    if (this.canvas.offsetParent === null) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(clientPosition);

    this.drawLine({
      from: this.prevCanvasPosition,
      to: canvasPosition,
    });

    this.pushHistory();
  }

  private handleMouseDown = (event: MouseEvent) =>
    this.handleDown({ x: event.clientX, y: event.clientY });

  private handleMouseMove = (event: MouseEvent) => {
    if (event.buttons === 0) {
      return;
    }

    this.handleMove({ x: event.clientX, y: event.clientY });
  };

  private handleMouseUp = (event: MouseEvent) =>
    this.handleUp({ x: event.clientX, y: event.clientY });

  private handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length < 1) {
      return;
    }

    this.handleDown({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  };

  private handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length < 1) {
      return;
    }

    this.handleMove({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  };

  private handleTouchEnd = (event: TouchEvent) => {
    if (event.touches.length < 1) {
      return;
    }

    this.handleUp({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
  };
}

customElements.define("kanvas-canvas", KanvasCanvas);

export { KanvasCanvas };
export type { KanvasHistoryChangeEvent };
