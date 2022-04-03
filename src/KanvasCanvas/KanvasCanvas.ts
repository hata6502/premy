import { brushes } from "../brushes";
import type { BrushType } from "../brushes";
import { fonts } from "../fonts";
import type { FontType } from "../fonts";
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

export type KanvasCanvasMode = "shape" | "text";

class KanvasCanvas extends HTMLElement {
  private brushType: BrushType;
  private canvas?: HTMLCanvasElement;
  private color: string;
  private context?: CanvasRenderingContext2D;
  private fontType: FontType;
  private history: string[];
  private historyIndex: number;
  private mode: KanvasCanvasMode;
  private prevPosition: KanvasPosition;
  private text;
  private textPreviewRect?: HTMLDivElement;
  private toneType: ToneType;
  private transactionMode?: KanvasCanvasMode;
  private actualZoom: number;
  private displayingZoom: number;

  constructor() {
    super();

    this.brushType = "light";
    this.color = "#000000";
    this.fontType = "sans-serif";
    this.history = [];
    this.historyIndex = -1;
    this.mode = "shape";
    this.prevPosition = { x: 0, y: 0 };
    this.text = "";
    this.toneType = "fill";
    this.actualZoom = 0;
    this.displayingZoom = 0;
  }

  connectedCallback(): void {
    this.innerHTML = `
      <style>
        .kanvas-canvas-container {
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .kanvas-canvas-container * {
          touch-action: pinch-zoom;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .kanvas-canvas-container .canvas {
          border: 1px solid #d3d3d3;
        }

        .kanvas-canvas-container .text-preview-rect {
          position: absolute;
          transform: translateY(-80%);
          white-space: nowrap;
        }
      </style>

      <div class="kanvas-canvas-container">
        <canvas class="canvas"></canvas>
        <div class="text-preview-rect"></div>
      </div>

      <kanvas-pointer-listener class="pointer-listener"></kanvas-pointer-listener>
    `;

    const canvas = this.querySelector(".canvas");
    const pointerListener = this.querySelector(".pointer-listener");
    const textPreviewRect = this.querySelector(".text-preview-rect");

    if (
      !(canvas instanceof HTMLCanvasElement) ||
      !(pointerListener instanceof KanvasPointerListener) ||
      !(textPreviewRect instanceof HTMLDivElement)
    ) {
      throw new Error("Canvas is not a 2D context");
    }

    this.canvas = canvas;
    this.textPreviewRect = textPreviewRect;

    this.addEventListener("contextmenu", this.handleContextmenu);

    pointerListener.addEventListener(
      "kanvasPointerDown",
      this.handlePointerDown
    );

    pointerListener.addEventListener(
      "kanvasPointerMove",
      this.handlePointerMove
    );

    pointerListener.addEventListener("kanvasPointerUp", this.handlePointerUp);
    pointerListener.addEventListener(
      "kanvasPointerCancel",
      this.handlePointerCancel
    );

    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas is not a 2D context");
    }

    this.context = context;
  }

  setBrushType({ brushType }: { brushType: BrushType }): void {
    this.brushType = brushType;
  }

  setColor({ color }: { color: string }): void {
    this.color = color;
  }

  setFontType({ fontType }: { fontType: FontType }): void {
    this.fontType = fontType;
  }

  setMode({ mode }: { mode: KanvasCanvasMode }): void {
    this.mode = mode;
  }

  setText({ text }: { text: string }): void {
    this.text = text;
  }

  setToneType({ toneType }: { toneType: ToneType }): void {
    this.toneType = toneType;
  }

  async load({
    src,
    pushesImageToHistory,
  }: {
    src: string;
    pushesImageToHistory: boolean;
  }): Promise<void> {
    const kanvasDialogRootElement = document.querySelector(
      ".kanvas-dialog-root"
    );

    if (!this.canvas || !this.context || !kanvasDialogRootElement) {
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
      (320 * 180) / (imageElement.naturalWidth * imageElement.naturalHeight)
    );

    const imageHeight = Math.round(imageElement.naturalHeight * density);
    const imageWidth = Math.round(imageElement.naturalWidth * density);

    const heightZoom =
      (kanvasDialogRootElement.clientHeight - 112) / imageHeight;
    const widthZoom =
      (Math.min(kanvasDialogRootElement.clientWidth, 1280) - 64) / imageWidth;

    this.displayingZoom = Math.min(heightZoom, widthZoom);
    this.canvas.style.height = `${imageHeight * this.displayingZoom}px`;
    this.canvas.style.width = `${imageWidth * this.displayingZoom}px`;

    this.actualZoom = Math.ceil(this.displayingZoom);
    this.canvas.height = imageHeight * this.actualZoom;
    this.canvas.width = imageWidth * this.actualZoom;

    this.context.imageSmoothingEnabled = false;

    this.context.drawImage(
      imageElement,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (pushesImageToHistory) {
      this.pushImageToHistory();
    }
  }

  redo(): void {
    if (this.historyIndex >= this.history.length - 1) {
      return;
    }

    this.historyIndex++;
    this.putImageFromHistory();
    this.dispatchChangeHistoryEvent();
  }

  toBlob(callback: BlobCallback, type?: string, quality?: unknown): void {
    if (!this.canvas) {
      throw new Error("Canvas is not a 2D context");
    }

    return this.canvas.toBlob(callback, type, quality);
  }

  toDataURL(type?: string, quality?: unknown): string {
    if (!this.canvas) {
      throw new Error("Canvas is not a 2D context");
    }

    return this.canvas.toDataURL(type, quality);
  }

  undo(): void {
    if (this.historyIndex < 1) {
      return;
    }

    this.historyIndex--;
    this.putImageFromHistory();
    this.dispatchChangeHistoryEvent();
  }

  private getCanvasPosition(clientPosition: KanvasPosition): KanvasPosition {
    if (!this.canvas) {
      throw new Error("Canvas is not a 2D context");
    }

    const domRect = this.canvas.getBoundingClientRect();
    const pixelX = clientPosition.x - (domRect.left + 1);
    const pixelY = clientPosition.y - (domRect.top + 1);

    return {
      x: Math.round(pixelX / this.displayingZoom),
      y: Math.round(pixelY / this.displayingZoom),
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
    if (!this.context || !this.textPreviewRect) {
      throw new Error("Canvas is not a 2D context");
    }

    const font = `${
      brushes[this.brushType].font.size * this.displayingZoom
    }px ${fonts[this.fontType]}`;

    this.context.font = font;

    this.textPreviewRect.style.left = `${
      position.x * this.displayingZoom + 1
    }px`;

    this.textPreviewRect.style.top = `${
      position.y * this.displayingZoom + 1
    }px`;

    this.textPreviewRect.style.color = this.color;
    this.textPreviewRect.style.font = font;
    this.textPreviewRect.textContent = this.text;
  }

  private drawLine({ from, to }: { from: KanvasPosition; to: KanvasPosition }) {
    const stepLength = Math.round(
      Math.sqrt(Math.pow(to.x - from.x, 2.0) + Math.pow(to.y - from.y, 2.0))
    );

    [...Array(stepLength).keys()].forEach((step) => {
      const distance = step / stepLength;

      this.drawPoint({
        x: Math.round(from.x + (to.x - from.x) * distance),
        y: Math.round(from.y + (to.y - from.y) * distance),
      });
    });
  }

  private drawPoint(position: KanvasPosition) {
    if (!this.context) {
      throw new Error("Canvas is not a 2D context");
    }

    const brush = brushes[this.brushType];
    const beginX = position.x - (brush.bitmap[0].length - 1) / 2;
    const beginY = position.y - (brush.bitmap.length - 1) / 2;
    const tone = tones[this.toneType];

    this.context.fillStyle = this.color;

    for (let y = beginY; y < beginY + brush.bitmap.length; y++) {
      for (let x = beginX; x < beginX + brush.bitmap[0].length; x++) {
        if (
          brush.bitmap[Math.abs(y - beginY)][Math.abs(x - beginX)] === 0 ||
          tone.bitmap[Math.abs(y % tone.bitmap.length)][
            Math.abs(x % tone.bitmap[0].length)
          ] === 0
        ) {
          continue;
        }

        this.context.fillRect(
          x * this.actualZoom,
          y * this.actualZoom,
          this.actualZoom,
          this.actualZoom
        );
      }
    }
  }

  private pushImageToHistory() {
    if (!this.canvas) {
      throw new Error("Canvas is not a 2D context");
    }

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

  private putImageFromHistory() {
    void this.load({
      src: this.history[this.historyIndex],
      pushesImageToHistory: false,
    });
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
        if (!this.context || !this.textPreviewRect) {
          throw new Error("Canvas is not a 2D context");
        }

        this.context.fillStyle = this.color;

        this.context.font = `${
          brushes[this.brushType].font.size * this.actualZoom
        }px ${fonts[this.fontType]}`;

        this.context.fillText(
          this.text,
          canvasPosition.x * this.actualZoom,
          canvasPosition.y * this.actualZoom
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

    this.pushImageToHistory();
    this.transactionMode = undefined;
  };

  private handlePointerCancel = () => {
    if (!this.transactionMode) {
      return;
    }

    if (!this.textPreviewRect) {
      throw new Error("Text preview rect is not defined");
    }

    switch (this.transactionMode) {
      case "shape": {
        this.putImageFromHistory();

        break;
      }

      case "text": {
        this.textPreviewRect.textContent = "";

        break;
      }

      default: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const exhaustiveCheck: never = this.transactionMode;

        throw new Error("Unknown mode");
      }
    }

    this.transactionMode = undefined;
  };
}

customElements.define("kanvas-canvas", KanvasCanvas);

export { KanvasCanvas };
export type { KanvasHistoryChangeEvent };
