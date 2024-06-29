import { brushes } from "../brushes";
import type { BrushType } from "../brushes";
import { fonts } from "../fonts";
import type { FontType } from "../fonts";
import { fuzzinesses, noisemap } from "../fuzziness";
import { ToneType, tonePeriod, tones } from "../tones";
import { PremyPointerListener } from "./PremyPointerListener";
import type {
  PremyPointerDownEvent,
  PremyPointerMoveEvent,
  PremyPointerUpEvent,
  PremyPosition,
} from "./PremyPointerListener";

const historyMaxLength = 100;

declare global {
  interface HTMLElementEventMap {
    premyHistoryChange: PremyHistoryChangeEvent;
    premyHistoryIndexChange: PremyHistoryIndexChangeEvent;
  }
}

export type PremyHistoryChangeEvent = CustomEvent<{
  history: string[];
  historyMaxLength: number;
  pushed: string[];
}>;
export type PremyHistoryIndexChangeEvent = CustomEvent<number>;

export type PremyCanvasMode = "shape" | "text";

const density = 2;

export class PremyCanvasElement extends HTMLElement {
  private brushType: BrushType;
  private canvas?: HTMLCanvasElement;
  private color: string;
  private context?: CanvasRenderingContext2D;
  private fontType: FontType;
  private history: string[];
  private historyIndex: number;
  private mode: PremyCanvasMode;
  private prevPosition: PremyPosition;
  private text;
  private textPreviewRect?: HTMLDivElement;
  private fuzziness: number;
  private toneType: ToneType;
  private transactionMode?: PremyCanvasMode;
  private pushingImageToHistoryTimeoutID?: number;
  private randomX256 = 0;
  private randomY256 = 0;

  constructor() {
    super();

    this.brushType = "small";
    this.color = "#000000";
    this.fontType = "sans-serif";
    this.history = [];
    this.historyIndex = -1;
    this.mode = "shape";
    this.prevPosition = { x: 0, y: 0 };
    this.text = "";
    this.fuzziness = fuzzinesses[0];
    this.toneType = "fill";
  }

  connectedCallback(): void {
    this.innerHTML = `
      <style>
        .premy-canvas-container {
          overflow: hidden;
          position: relative;
        }

        .premy-canvas-container * {
          touch-action: pinch-zoom;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .premy-canvas-container canvas {
          width: 100%;
          height: 100%;
        }

        .premy-canvas-container .text-preview-rect {
          position: absolute;
          transform: translate(-50%, -54%);
          white-space: nowrap;
        }
      </style>

      <div class="premy-canvas-container">
        <canvas class="canvas"></canvas>
        <div class="text-preview-rect"></div>
      </div>

      <premy-pointer-listener class="pointer-listener"></premy-pointer-listener>
    `;

    const canvas = this.querySelector(".canvas");
    const pointerListener = this.querySelector(".pointer-listener");
    const textPreviewRect = this.querySelector(".text-preview-rect");

    if (
      !(canvas instanceof HTMLCanvasElement) ||
      !(pointerListener instanceof PremyPointerListener) ||
      !(textPreviewRect instanceof HTMLDivElement)
    ) {
      throw new Error("Canvas is not a 2D context");
    }

    this.canvas = canvas;
    this.textPreviewRect = textPreviewRect;

    this.addEventListener("contextmenu", this.handleContextmenu);

    pointerListener.addEventListener(
      "premyPointerDown",
      this.handlePointerDown
    );

    pointerListener.addEventListener(
      "premyPointerMove",
      this.handlePointerMove
    );

    pointerListener.addEventListener("premyPointerUp", this.handlePointerUp);
    pointerListener.addEventListener(
      "premyPointerCancel",
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

  setMode({ mode }: { mode: PremyCanvasMode }): void {
    this.mode = mode;
  }

  setText({ text }: { text: string }): void {
    this.text = text;
  }

  setFuzziness({ fuzziness }: { fuzziness: number }): void {
    this.fuzziness = fuzziness;
  }

  setToneType({ toneType }: { toneType: ToneType }): void {
    this.toneType = toneType;
  }

  async load({
    src,
    constrainsAspectRatio,
    pushesImageToHistory,
  }: {
    src: string;
    constrainsAspectRatio: boolean;
    pushesImageToHistory: boolean;
  }): Promise<void> {
    const containerElement = this.querySelector(".premy-canvas-container");
    if (
      !this.canvas ||
      !this.context ||
      !(containerElement instanceof HTMLElement)
    ) {
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

    const imageHeight = constrainsAspectRatio
      ? imageElement.naturalHeight / devicePixelRatio
      : window.innerHeight;
    const imageWidth = constrainsAspectRatio
      ? imageElement.naturalWidth / devicePixelRatio
      : window.innerWidth;

    containerElement.style.height = `${imageHeight}px`;
    containerElement.style.width = `${imageWidth}px`;

    // For retina display.
    this.canvas.height = imageHeight * devicePixelRatio;
    this.canvas.width = imageWidth * devicePixelRatio;

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

  setHistory(history: string[]): void {
    this.history = history;
    this.putImageFromHistory();

    const event: PremyHistoryChangeEvent = new CustomEvent(
      "premyHistoryChange",
      {
        bubbles: true,
        composed: true,
        detail: {
          history: this.history,
          historyMaxLength,
          pushed: [],
        },
      }
    );
    this.dispatchEvent(event);
  }

  setHistoryIndex(historyIndex: number): void {
    this.historyIndex = historyIndex;
    this.putImageFromHistory();
    this.dispatchHistoryIndexChangeEvent();
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

  private getCanvasPosition(clientPosition: PremyPosition): PremyPosition {
    if (!this.canvas) {
      throw new Error("Canvas is not a 2D context");
    }

    const domRect = this.canvas.getBoundingClientRect();
    const pixelX = clientPosition.x - (domRect.left + 1);
    const pixelY = clientPosition.y - (domRect.top + 1);

    return {
      x: Math.round(pixelX / density),
      y: Math.round(pixelY / density),
    };
  }

  private dispatchHistoryIndexChangeEvent() {
    const event: PremyHistoryIndexChangeEvent = new CustomEvent(
      "premyHistoryIndexChange",
      {
        bubbles: true,
        composed: true,
        detail: this.historyIndex,
      }
    );
    this.dispatchEvent(event);
  }

  private displayTextPreviewRect(position: PremyPosition) {
    if (!this.context || !this.textPreviewRect) {
      throw new Error("Canvas is not a 2D context");
    }

    this.textPreviewRect.style.font = `${
      brushes[this.brushType].font.size * density
    }px ${fonts[this.fontType]}`;
    this.textPreviewRect.style.left = `${position.x * density}px`;
    this.textPreviewRect.style.top = `${position.y * density}px`;
    this.textPreviewRect.style.color = this.color;
    this.textPreviewRect.textContent = this.text;
  }

  private drawLine({ from, to }: { from: PremyPosition; to: PremyPosition }) {
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

  private drawPoint(position: PremyPosition) {
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
        const brushBit =
          brush.bitmap[Math.abs(y - beginY)][Math.abs(x - beginX)];

        const x256 = Math.abs((x + this.randomX256) % 256);
        const y256 = Math.abs((y + this.randomY256) % 256);
        const modulatedX = Math.floor(
          x + noisemap[y256][x256] * this.fuzziness
        );
        const modulatedY = Math.floor(
          y + noisemap[x256][y256] * this.fuzziness
        );
        const toneBit =
          tone.bitmap[Math.abs(modulatedY % tonePeriod)][
            Math.abs(modulatedX % tonePeriod)
          ];

        if (!brushBit || !toneBit) {
          continue;
        }

        this.context.fillRect(
          x * density * devicePixelRatio,
          y * density * devicePixelRatio,
          density * devicePixelRatio,
          density * devicePixelRatio
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

    const pushed: string[] = [];
    if (this.historyIndex !== this.history.length - 1) {
      pushed.push(this.history[this.historyIndex]);
    }
    pushed.push(dataURL);

    this.history = [...this.history, ...pushed];
    this.history = this.history.slice(
      Math.max(this.history.length - historyMaxLength, 0)
    );
    this.historyIndex = this.history.length - 1;

    const event: PremyHistoryChangeEvent = new CustomEvent(
      "premyHistoryChange",
      {
        bubbles: true,
        composed: true,
        detail: {
          history: this.history,
          historyMaxLength,
          pushed,
        },
      }
    );
    this.dispatchEvent(event);
    this.dispatchHistoryIndexChangeEvent();
  }

  private putImageFromHistory() {
    const src = this.history[this.historyIndex];
    if (!src) {
      return;
    }

    void this.load({
      src,
      constrainsAspectRatio: true,
      pushesImageToHistory: false,
    });
  }

  private setPushingImageToHistoryTimeout() {
    this.pushingImageToHistoryTimeoutID = window.setTimeout(() => {
      this.pushImageToHistory();
    }, 100);
  }

  private handleContextmenu = (event: Event) => event.preventDefault();

  private handlePointerDown = (event: PremyPointerDownEvent) => {
    if (this.transactionMode) {
      return;
    }

    const position = this.getCanvasPosition(event.detail);

    switch (this.mode) {
      case "shape": {
        this.transactionMode = "shape";
        this.randomX256 = Math.floor(Math.random() * 256);
        this.randomY256 = Math.floor(Math.random() * 256);
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
    clearTimeout(this.pushingImageToHistoryTimeoutID);
  };

  private handlePointerMove = (event: PremyPointerMoveEvent) => {
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

  private handlePointerUp = (event: PremyPointerUpEvent) => {
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
          brushes[this.brushType].font.size * density * devicePixelRatio
        }px ${fonts[this.fontType]}`;
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";

        this.context.fillText(
          this.text,
          canvasPosition.x * density * devicePixelRatio,
          canvasPosition.y * density * devicePixelRatio
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

    this.transactionMode = undefined;
    this.setPushingImageToHistoryTimeout();
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
    this.setPushingImageToHistoryTimeout();
  };
}

if (!customElements.get("premy-canvas")) {
  customElements.define("premy-canvas", PremyCanvasElement);
}
