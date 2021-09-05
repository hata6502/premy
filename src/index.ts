import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { KanvasCanvas } from "./KanvasCanvas";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "kanvas-canvas": DetailedHTMLProps<
        HTMLAttributes<KanvasCanvas>,
        KanvasCanvas
      >;
    }
  }
}

export * from "./KanvasDialog";
