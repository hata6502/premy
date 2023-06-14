import Color from "color";
import colorDiff from "color-diff";
import { brushes } from "../brushes";
import type { BrushType } from "../brushes";
import { fonts } from "../fonts";
import type { FontType } from "../fonts";
import { fuzzinesses, noisemap } from "../fuzziness";
import { palettes } from "../palettes";
import { ToneType, tonePeriod, tones } from "../tones";
import { PremyPointerListener } from "./PremyPointerListener";
import type {
  PremyPointerDownEvent,
  PremyPointerMoveEvent,
  PremyPointerUpEvent,
  PremyPosition,
} from "./PremyPointerListener";

const historyMaxLength = 30;

declare global {
  interface HTMLElementEventMap {
    premyHistoryChange: PremyHistoryChangeEvent;
    premyLoadStart: PremyLoadStartEvent;
    premyLoadEnd: PremyLoadEndEvent;
  }
}

export type PremyHistoryChangeEvent = CustomEvent<{
  history: string[];
  historyIndex: number;
}>;

export type PremyLoadStartEvent = CustomEvent<{
  isHeavy: boolean;
}>;
export type PremyLoadEndEvent = CustomEvent<never>;

export type PremyCanvasMode = "shape" | "text";
export type LoadMode = "normal" | "mibae" | "tracing";

const ditheringRate = 0.5;
const ditheringPattern = [
  {
    deltaX: 1,
    deltaY: 0,
    rate: (7 / 16) * ditheringRate,
  },
  {
    deltaX: -1,
    deltaY: 1,
    rate: (3 / 16) * ditheringRate,
  },
  {
    deltaX: 0,
    deltaY: 1,
    rate: (5 / 16) * ditheringRate,
  },
  {
    deltaX: 1,
    deltaY: 1,
    rate: (1 / 16) * ditheringRate,
  },
];

const colors = Object.values(palettes).flat();
const tonePeriodRange = [...Array(tonePeriod).keys()];

const patternImageDataCache = Object.fromEntries(
  Object.keys(tones).map((toneType) => {
    return [
      toneType,
      Object.fromEntries(
        colors.map((backgroundColor) => {
          return [
            backgroundColor,
            Object.fromEntries(
              colors.map((foregroundColor) => {
                return [
                  foregroundColor,
                  tonePeriodRange.map((_offsetY) => {
                    return tonePeriodRange.map((_offsetX) => {
                      return undefined as ImageData | undefined;
                    });
                  }),
                ];
              })
            ),
          ];
        })
      ),
    ];
  })
);

interface Pattern {
  toneType: ToneType;
  backgroundColor: string;
  foregroundColor: string;
  offsetY: number;
  offsetX: number;
}

const getPatternImageData = ({
  toneType,
  backgroundColor,
  foregroundColor,
  offsetY,
  offsetX,
}: Pattern) => {
  const cachedPatternImageData =
    patternImageDataCache[toneType][backgroundColor][foregroundColor][offsetY][
      offsetX
    ];

  if (cachedPatternImageData) {
    return cachedPatternImageData;
  }

  const tone = tones[toneType];
  const data: number[] = [];

  tonePeriodRange.forEach((y) => {
    tonePeriodRange.forEach((x) => {
      const isForeground =
        tone.bitmap[(y + offsetY) % tonePeriod][(x + offsetX) % tonePeriod];

      const color = isForeground ? foregroundColor : backgroundColor;

      data.push(...Color(color).rgb().array(), 255);
    });
  });

  const patternImageData = new ImageData(
    new Uint8ClampedArray(data),
    tonePeriod,
    tonePeriod
  );

  patternImageDataCache[toneType][backgroundColor][foregroundColor][offsetY][
    offsetX
  ] = patternImageData;

  return patternImageData;
};

const colorDiffCache = new Map<string, number>();

const getBestPattern = ({
  data,
  patterns,
}: {
  data: Uint8ClampedArray;
  patterns: Pattern[];
}) => {
  let bestPattern = patterns[0];
  let bestPatternDistance = Infinity;

  patterns.forEach((pattern) => {
    let distance = 0;

    for (let dataIndex = 0; dataIndex < data.length; dataIndex += 4) {
      // Out of canvas area.
      if (data[dataIndex + 3] !== 255) {
        continue;
      }

      const patternImageData = getPatternImageData(pattern);

      const colorDiffKey = [
        data[dataIndex + 0],
        data[dataIndex + 1],
        data[dataIndex + 2],
        patternImageData.data[dataIndex + 0],
        patternImageData.data[dataIndex + 1],
        patternImageData.data[dataIndex + 2],
      ].join("-");

      const diff =
        colorDiffCache.get(colorDiffKey) ??
        colorDiff.diff(
          colorDiff.rgb_to_lab({
            R: data[dataIndex + 0],
            G: data[dataIndex + 1],
            B: data[dataIndex + 2],
          }),
          colorDiff.rgb_to_lab({
            R: patternImageData.data[dataIndex + 0],
            G: patternImageData.data[dataIndex + 1],
            B: patternImageData.data[dataIndex + 2],
          })
        );

      colorDiffCache.set(colorDiffKey, diff);
      distance += diff;
    }

    if (distance < bestPatternDistance) {
      bestPattern = pattern;
      bestPatternDistance = distance;
    }
  });

  return bestPattern;
};

class PremyCanvas extends HTMLElement {
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
  private actualZoom: number;
  private displayingZoom: number;
  private pushingImageToHistoryTimeoutID?: number;

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
    this.actualZoom = 0;
    this.displayingZoom = 0;
  }

  connectedCallback(): void {
    this.innerHTML = `
      <style>
        .premy-canvas-container {
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .premy-canvas-container * {
          touch-action: pinch-zoom;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        .premy-canvas-container .canvas {
          border: 1px solid #e0e0e0;
        }

        .premy-canvas-container .text-preview-rect {
          position: absolute;
          transform: translateY(-80%);
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
    loadMode,
    pushesImageToHistory,
  }: {
    src: string;
    constrainsAspectRatio: boolean;
    loadMode: LoadMode;
    pushesImageToHistory: boolean;
  }): Promise<void> {
    const isHeavy = {
      normal: false,
      mibae: true,
      tracing: true,
    }[loadMode];
    const premyLoadStartEvent: PremyLoadStartEvent = new CustomEvent(
      "premyLoadStart",
      {
        bubbles: true,
        composed: true,
        detail: { isHeavy },
      }
    );

    this.dispatchEvent(premyLoadStartEvent);

    try {
      const premyDialogRootElement =
        document.querySelector(".premy-dialog-root");

      if (!this.canvas || !this.context || !premyDialogRootElement) {
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

      const canvasMaxHeight = premyDialogRootElement.clientHeight - 112;
      const canvasMaxWidth =
        Math.min(premyDialogRootElement.clientWidth, 1280) - 64;

      const naturalImageHeight = constrainsAspectRatio
        ? imageElement.naturalHeight
        : canvasMaxHeight;
      const naturalImageWidth = constrainsAspectRatio
        ? imageElement.naturalWidth
        : canvasMaxWidth;

      const density = Math.sqrt(
        (320 * 180) / (naturalImageWidth * naturalImageHeight)
      );

      const imageHeight = Math.round(naturalImageHeight * density);
      const imageWidth = Math.round(naturalImageWidth * density);

      const heightZoom = canvasMaxHeight / imageHeight;
      const widthZoom = canvasMaxWidth / imageWidth;

      this.displayingZoom = Math.min(heightZoom, widthZoom);
      this.canvas.style.height = `${imageHeight * this.displayingZoom}px`;
      this.canvas.style.width = `${imageWidth * this.displayingZoom}px`;

      // For retina display.
      this.actualZoom = Math.ceil(this.displayingZoom * 2);
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

      switch (loadMode) {
        case "normal": {
          break;
        }

        case "mibae": {
          await this.applyMibaeFilter();
          break;
        }

        case "tracing": {
          await this.applyTracingFilter();
          break;
        }

        default: {
          const exhaustiveCheck: never = loadMode;
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Unknown load mode: ${exhaustiveCheck}`);
        }
      }

      if (pushesImageToHistory) {
        this.pushImageToHistory();
      }
    } finally {
      const premyLoadEndEvent: PremyLoadEndEvent = new CustomEvent(
        "premyLoadEnd",
        { bubbles: true, composed: true }
      );

      this.dispatchEvent(premyLoadEndEvent);
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

  private getCanvasPosition(clientPosition: PremyPosition): PremyPosition {
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

  private async applyMibaeFilter() {
    if (!this.canvas) {
      throw new Error("Canvas is not a 2D context");
    }

    const shrinkedCanvasElement = document.createElement("canvas");

    shrinkedCanvasElement.width = this.canvas.width / this.actualZoom;
    shrinkedCanvasElement.height = this.canvas.height / this.actualZoom;

    const shrinkedContext = shrinkedCanvasElement.getContext("2d");

    if (!shrinkedContext) {
      throw new Error("Canvas is not a 2D context");
    }

    shrinkedContext.imageSmoothingEnabled = false;

    shrinkedContext.drawImage(
      this.canvas,
      0,
      0,
      shrinkedCanvasElement.width,
      shrinkedCanvasElement.height
    );

    for (let y = 0; y < shrinkedCanvasElement.height; y++) {
      if (y % tonePeriod ** 2 === 0) {
        colorDiffCache.clear();
      }

      [...Array(shrinkedCanvasElement.width).keys()].forEach((x) => {
        if (!this.context) {
          throw new Error("Canvas is not a 2D context");
        }

        const beginX = x - tonePeriod / 2;
        const beginY = y - tonePeriod / 2;

        const windowImageData = shrinkedContext.getImageData(
          beginX,
          beginY,
          tonePeriod,
          tonePeriod
        );

        const normalizedData = Uint8ClampedArray.from(windowImageData.data);
        const lightnesses = [];

        for (
          let dataIndex = 0;
          dataIndex < normalizedData.length;
          dataIndex += 4
        ) {
          // Out of canvas area.
          if (normalizedData[dataIndex + 3] !== 255) {
            continue;
          }

          const average = Color({
            r: normalizedData[dataIndex + 0],
            g: normalizedData[dataIndex + 1],
            b: normalizedData[dataIndex + 2],
          })
            .grayscale()
            .red();

          normalizedData[dataIndex + 0] =
            normalizedData[dataIndex + 1] =
            normalizedData[dataIndex + 2] =
              average;

          lightnesses.push(average);
        }

        const maxLightness = Math.max(...lightnesses);
        const minLightness = Math.min(...lightnesses);

        for (
          let dataIndex = 0;
          dataIndex < normalizedData.length;
          dataIndex += 4
        ) {
          // Out of canvas area.
          if (normalizedData[dataIndex + 3] !== 255) {
            continue;
          }

          normalizedData[dataIndex + 0] =
            normalizedData[dataIndex + 1] =
            normalizedData[dataIndex + 2] =
              ((normalizedData[dataIndex + 0] - minLightness) * 255) /
              (maxLightness - minLightness);
        }

        const offsetX = Math.abs(beginX % tonePeriod);
        const offsetY = Math.abs(beginY % tonePeriod);

        const { toneType } = getBestPattern({
          data: normalizedData,
          patterns: Object.keys(tones).map((toneType) => ({
            toneType: toneType as ToneType,
            backgroundColor: palettes.light[0],
            foregroundColor: palettes.dark[0],
            offsetY,
            offsetX,
          })),
        });
        const tone = tones[toneType];

        const { backgroundColor } = getBestPattern({
          data: windowImageData.data,
          patterns: colors.map((backgroundColor) => ({
            toneType,
            backgroundColor,
            foregroundColor: palettes.dark[0],
            offsetY,
            offsetX,
          })),
        });

        const { foregroundColor } = getBestPattern({
          data: windowImageData.data,
          patterns: colors.map((foregroundColor) => ({
            toneType,
            backgroundColor,
            foregroundColor,
            offsetY,
            offsetX,
          })),
        });

        const isForeground = tone.bitmap[y % tonePeriod][x % tonePeriod];

        this.context.fillStyle = isForeground
          ? foregroundColor
          : backgroundColor;

        this.context.fillRect(
          x * this.actualZoom,
          y * this.actualZoom,
          this.actualZoom,
          this.actualZoom
        );

        // Floyd–Steinberg dithering
        const [originalR, originalG, originalB] = shrinkedContext.getImageData(
          x,
          y,
          1,
          1
        ).data;

        const [putR, putG, putB] = this.context.getImageData(
          x * this.actualZoom,
          y * this.actualZoom,
          1,
          1
        ).data;

        ditheringPattern.forEach(({ deltaX, deltaY, rate }) => {
          const NeighborhoodImageData = shrinkedContext.getImageData(
            x + deltaX,
            y + deltaY,
            1,
            1
          );

          NeighborhoodImageData.data[0] += (originalR - putR) * rate;
          NeighborhoodImageData.data[1] += (originalG - putG) * rate;
          NeighborhoodImageData.data[2] += (originalB - putB) * rate;

          shrinkedContext.putImageData(
            NeighborhoodImageData,
            x + deltaX,
            y + deltaY
          );
        });
      });

      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  private async applyTracingFilter() {
    if (!this.canvas || !this.context) {
      throw new Error("Canvas is not a 2D context");
    }

    const originalCanvasElement = document.createElement("canvas");

    originalCanvasElement.width = this.canvas.width;
    originalCanvasElement.height = this.canvas.height;

    const originalContext = originalCanvasElement.getContext("2d");

    if (!originalContext) {
      throw new Error("Canvas is not a 2D context");
    }

    originalContext.drawImage(this.canvas, 0, 0);

    this.context.fillStyle = "#fafafa";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const windowImageData = originalContext.getImageData(
          x - 1,
          y - 1,
          3,
          3
        ).data;

        // Laplacian filter
        let opacity = 0;

        [1, 1, 1, 1, -8, 1, 1, 1, 1].forEach((weight, index) => {
          const lightness = Color({
            r: windowImageData[index * 4 + 0],
            g: windowImageData[index * 4 + 1],
            b: windowImageData[index * 4 + 2],
          })
            .grayscale()
            .red();

          opacity += (lightness / 255) * weight;
        });

        this.context.fillStyle = Color({
          r: windowImageData[4 * 4 + 0],
          g: windowImageData[4 * 4 + 1],
          b: windowImageData[4 * 4 + 2],
        })
          .alpha(opacity)
          .hexa();

        this.context.fillRect(x, y, 1, 1);
      }

      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  private dispatchChangeHistoryEvent() {
    const event: PremyHistoryChangeEvent = new CustomEvent(
      "premyHistoryChange",
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

  private displayTextPreviewRect(position: PremyPosition) {
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

        const x256 = Math.abs(x % 256);
        const y256 = Math.abs(y % 256);
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
      constrainsAspectRatio: true,
      loadMode: "normal",
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

customElements.define("premy-canvas", PremyCanvas);

export { PremyCanvas };
