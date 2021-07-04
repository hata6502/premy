import "@material/mwc-dialog";
import { dialogMaxWidth } from "../KanvasDialog";
import { KanvasPointerListener } from "./KanvasPointerListener";
import type {
  KanvasPointerDownEvent,
  KanvasPointerMoveEvent,
  KanvasPointerUpEvent,
  KanvasPosition,
} from "./KanvasPointerListener";

const canvasHeight = 180;
const canvasWidth = 320;

const historyMaxLength = 30;

declare global {
  interface HTMLElementEventMap {
    kanvasHistoryChange: KanvasHistoryChangeEvent;
  }
}

type KanvasHistoryChangeEvent = CustomEvent<{
  isRedoable: boolean;
  isUndoable: boolean;
}>;

class KanvasCanvas extends HTMLElement {
  private canvas;
  private zoom;

  private history: string[];
  private historyIndex: number;
  private prevCanvasPosition: KanvasPosition;

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

      <kanvas-pointer-listener id="pointer-listener"></kanvas-pointer-listener>
    `;

    const canvas = shadow.querySelector("#canvas");
    const pointerListener = shadow.querySelector("#pointer-listener");

    if (
      !(canvas instanceof HTMLCanvasElement) ||
      !(pointerListener instanceof KanvasPointerListener)
    ) {
      throw new Error("Could not find canvas or pointer listener");
    }

    this.canvas = canvas;

    const heightZoom = (window.innerHeight - 128) / canvasHeight;
    const widthZoom =
      (Math.min(window.innerWidth, dialogMaxWidth) - 96) / canvasWidth;

    this.zoom = Math.min(heightZoom, widthZoom);

    this.canvas.height = canvasHeight * this.zoom;
    this.canvas.width = canvasWidth * this.zoom;
    this.clear();

    pointerListener.addEventListener(
      "kanvasPointerDown",
      this.handlePointerDown
    );
    pointerListener.addEventListener(
      "kanvasPointerMove",
      this.handlePointerMove
    );
    pointerListener.addEventListener("kanvasPointerUp", this.handlePointerUp);
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

  private getCanvasPosition(clientPosition: KanvasPosition): KanvasPosition {
    const domRect = this.canvas.getBoundingClientRect();
    const pixelX = clientPosition.x - (domRect.left + 1);
    const pixelY = clientPosition.y - (domRect.top + 1);

    return {
      x: Math.round(pixelX / this.zoom),
      y: Math.round(pixelY / this.zoom),
    };
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

  private drawLine({ from, to }: { from: KanvasPosition; to: KanvasPosition }) {
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

  private handlePointerDown = (event: KanvasPointerDownEvent) => {
    if (this.canvas.offsetParent === null) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(event.detail);

    this.drawLine({
      from: canvasPosition,
      to: canvasPosition,
    });

    this.prevCanvasPosition = canvasPosition;
  };

  private handlePointerMove = (event: KanvasPointerMoveEvent) => {
    if (this.canvas.offsetParent === null) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(event.detail);

    this.drawLine({
      from: this.prevCanvasPosition,
      to: canvasPosition,
    });

    this.prevCanvasPosition = canvasPosition;
  };

  private handlePointerUp = (event: KanvasPointerUpEvent) => {
    if (this.canvas.offsetParent === null) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(event.detail);

    this.drawLine({
      from: this.prevCanvasPosition,
      to: canvasPosition,
    });

    this.pushHistory();
  };
}

customElements.define("kanvas-canvas", KanvasCanvas);

export { KanvasCanvas };
export type { KanvasHistoryChangeEvent };
