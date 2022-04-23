import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { PremyCanvas } from "./PremyCanvas";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "premy-canvas": DetailedHTMLProps<
        HTMLAttributes<PremyCanvas>,
        PremyCanvas
      >;
    }
  }
}

export * from "./PremyDialog";
