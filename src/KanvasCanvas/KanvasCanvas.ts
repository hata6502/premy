import { brushes } from "../brushes";
import type { BrushType } from "../brushes";
import { tones } from "../tones";
import type { ToneType } from "../tones";
import { KanvasPointerListener } from "./KanvasPointerListener";
import type {
  KanvasPointerDownEvent,
  KanvasPointerMoveEvent,
  KanvasPointerUpEvent,
  KanvasPosition,
} from "./KanvasPointerListener";

const historyMaxLength = 30;

declare global {
  interface HTMLElementEventMap {
    kanvasHistoryChange: KanvasHistoryChangeEvent;
  }
}

type KanvasHistoryChangeEvent = CustomEvent<{
  history: string[];
  historyIndex: number;
}>;

type Mode = "shape" | "text";

class KanvasCanvas extends HTMLElement {
  private brushType: BrushType;
  private canvas;
  private color: string;
  private height: number;
  private history: string[];
  private historyIndex: number;
  private mode: Mode;
  private prevPosition: KanvasPosition;
  private text;
  private textPreviewRect;
  private toneType: ToneType;
  private transactionMode?: Mode;
  private width: number;
  private zoom: number;

  constructor() {
    super();

    this.brushType = "light";
    this.color = "#000000";
    this.height = 0;
    this.history = [];
    this.historyIndex = -1;
    this.mode = "shape";
    this.prevPosition = { x: 0, y: 0 };
    this.text = "";
    this.toneType = "fill";
    this.width = 0;
    this.zoom = 0;

    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        #canvas {
          border: 1px solid #d3d3d3;
          vertical-align: bottom;
        }

        #container {
          position: relative;
          overflow: hidden;
        }

        #text-preview-rect {
          position: absolute;
          white-space: nowrap;
        }
      </style>

      <div id="container">
        <canvas id="canvas"></canvas>
        <kanvas-pointer-listener id="pointer-listener"></kanvas-pointer-listener>
        <div id="text-preview-rect"></div>
      </div>
    `;

    const canvas = shadow.querySelector("#canvas");
    const pointerListener = shadow.querySelector("#pointer-listener");
    const textPreviewRect = shadow.querySelector("#text-preview-rect");

    if (
      !(canvas instanceof HTMLCanvasElement) ||
      !(pointerListener instanceof KanvasPointerListener) ||
      !(textPreviewRect instanceof HTMLDivElement)
    ) {
      throw new Error("Canvas is not a 2D context");
    }

    this.canvas = canvas;
    this.textPreviewRect = textPreviewRect;

    shadow.addEventListener("contextmenu", this.handleContextmenu);

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

  setBrushType({ brushType }: { brushType: BrushType }): void {
    this.brushType = brushType;
  }

  setColor({ color }: { color: string }): void {
    this.color = color;
  }

  setMode({ mode }: { mode: Mode }): void {
    this.mode = mode;
  }

  setText({ text }: { text: string }): void {
    this.text = text;
  }

  setToneType({ toneType }: { toneType: ToneType }): void {
    this.toneType = toneType;
  }

  clear(): void {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    context.fillStyle = this.color;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.pushHistory();
  }

  async load({ src }: { src: string }): Promise<void> {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    const imageElement = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const imageElement = new Image();

        imageElement.addEventListener("error", (event) => reject(event));
        imageElement.addEventListener("load", () => resolve(imageElement));
        imageElement.src = src;
      }
    );

    const density = Math.sqrt(
      (320 * 180) / imageElement.naturalWidth / imageElement.naturalHeight
    );

    this.height = Math.round(imageElement.naturalHeight * density);
    this.width = Math.round(imageElement.naturalWidth * density);

    const heightZoom = (window.innerHeight - 188) / this.height;
    const widthZoom = (Math.min(window.innerWidth, 1280) - 120) / this.width;

    this.zoom = Math.min(heightZoom, widthZoom);
    this.canvas.height = this.height * this.zoom;
    this.canvas.width = this.width * this.zoom;

    context.drawImage(
      imageElement,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.pushHistory();
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) {
      return;
    }

    this.historyIndex++;
    this.putHistory();
    this.dispatchChangeHistoryEvent();
  }

  toBlob(callback: BlobCallback, type?: string, quality?: unknown): void {
    return this.canvas.toBlob(callback, type, quality);
  }

  toDataURL(type?: string, quality?: unknown): string {
    return this.canvas.toDataURL(type, quality);
  }

  undo(): void {
    if (this.historyIndex < 1) {
      return;
    }

    this.historyIndex--;
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
        bubbles: true,
        composed: true,
        detail: {
          history: this.history,
          historyIndex: this.historyIndex,
        },
      }
    );

    this.dispatchEvent(event);
  }

  private displayTextPreviewRect(position: KanvasPosition) {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    const font = `${
      brushes[this.brushType].font.size * this.zoom
    }px sans-serif`;

    context.font = font;

    this.textPreviewRect.style.left = `${position.x * this.zoom}px`;
    this.textPreviewRect.style.top = `${position.y * this.zoom}px`;
    this.textPreviewRect.style.color = this.color;
    this.textPreviewRect.style.font = font;
    this.textPreviewRect.style.transform = "translateY(-75%)";
    this.textPreviewRect.textContent = this.text;
  }

  private drawLine({ from, to }: { from: KanvasPosition; to: KanvasPosition }) {
    const stepLength = Math.round(
      Math.sqrt(Math.pow(to.x - from.x, 2.0) + Math.pow(to.y - from.y, 2.0))
    );

    [...Array(stepLength).keys()].forEach((step) => {
      const distance = step / stepLength;

      this.drawPoint({
        x: from.x + Math.round((to.x - from.x) * distance),
        y: from.y + Math.round((to.y - from.y) * distance),
      });
    });
  }

  private drawPoint(position: KanvasPosition) {
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    const brush = brushes[this.brushType];
    const beginX = position.x - (brush.bitmap[0].length - 1) / 2;
    const beginY = position.y - (brush.bitmap.length - 1) / 2;
    const tone = tones[this.toneType];

    context.fillStyle = this.color;

    for (let y = beginY; y < beginY + brush.bitmap.length; y++) {
      if (y < 0 || y >= this.height) {
        continue;
      }

      for (let x = beginX; x < beginX + brush.bitmap[0].length; x++) {
        if (
          x < 0 ||
          x >= this.width ||
          brush.bitmap[y - beginY][x - beginX] === 0 ||
          tone.bitmap[y % tone.bitmap.length][x % tone.bitmap[0].length] === 0
        ) {
          continue;
        }

        const rectLeft = Math.round(x * this.zoom);
        const rectTop = Math.round(y * this.zoom);

        context.fillRect(
          rectLeft,
          rectTop,
          Math.round((x + 1) * this.zoom) - rectLeft,
          Math.round((y + 1) * this.zoom) - rectTop
        );
      }
    }
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

  private handleContextmenu = (event: Event) => event.preventDefault();

  private handlePointerDown = (event: KanvasPointerDownEvent) => {
    if (this.transactionMode) {
      return;
    }

    const position = this.getCanvasPosition(event.detail);

    switch (this.mode) {
      case "shape": {
        this.transactionMode = "shape";
        this.drawPoint(position);

        break;
      }

      case "text": {
        // To use the actions UI.
        if (
          position.x < 0 ||
          position.x >= this.width ||
          position.y < 0 ||
          position.y >= this.height
        ) {
          break;
        }

        this.transactionMode = "text";
        this.displayTextPreviewRect(position);

        break;
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exhaustiveCheck: never = this.mode;

        throw new Error("Unknown mode");
      }
    }

    this.prevPosition = position;
  };

  private handlePointerMove = (event: KanvasPointerMoveEvent) => {
    if (!this.transactionMode) {
      return;
    }

    const position = this.getCanvasPosition(event.detail);

    switch (this.transactionMode) {
      case "shape": {
        this.drawLine({
          from: this.prevPosition,
          to: position,
        });

        break;
      }

      case "text": {
        this.displayTextPreviewRect(position);

        break;
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exhaustiveCheck: never = this.transactionMode;

        throw new Error("Unknown mode");
      }
    }

    this.prevPosition = position;
  };

  private handlePointerUp = (event: KanvasPointerUpEvent) => {
    if (!this.transactionMode) {
      return;
    }

    const canvasPosition = this.getCanvasPosition(event.detail);

    switch (this.transactionMode) {
      case "shape": {
        this.drawLine({
          from: this.prevPosition,
          to: canvasPosition,
        });

        break;
      }

      case "text": {
        const context = this.canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas is not a 2D context");
        }

        context.fillStyle = this.color;

        context.font = `${
          brushes[this.brushType].font.size * this.zoom
        }px sans-serif`;

        context.fillText(
          this.text,
          Math.round(canvasPosition.x * this.zoom),
          Math.round(canvasPosition.y * this.zoom)
        );

        this.textPreviewRect.textContent = "";

        break;
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exhaustiveCheck: never = this.transactionMode;

        throw new Error("Unknown mode");
      }
    }

    this.pushHistory();
    this.transactionMode = undefined;
  };
}

customElements.define("kanvas-canvas", KanvasCanvas);

export { KanvasCanvas };
export type { KanvasHistoryChangeEvent };
