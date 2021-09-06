import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { KanvasCanvas } from "./KanvasCanvas";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
