import { DetailedHTMLProps, HTMLAttributes } from "react";
import { PremyCanvasElement } from "./PremyCanvasElement";
import { PremyDialogElement } from "./PremyDialogElement";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "premy-canvas": DetailedHTMLProps<
        HTMLAttributes<PremyCanvasElement>,
        PremyCanvasElement
      >;
      "premy-dialog": DetailedHTMLProps<
        HTMLAttributes<PremyDialogElement>,
        PremyDialogElement
      >;
    }
  }
}

export * from "./PremyCanvasElement";
export * from "./PremyDialogElement";
