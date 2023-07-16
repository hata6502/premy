import { DetailedHTMLProps, HTMLAttributes } from "react";
import { PremyCanvas } from "./PremyCanvas";
import { PremyDialog } from "./PremyDialog";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "premy-canvas": DetailedHTMLProps<
        HTMLAttributes<PremyCanvas>,
        PremyCanvas
      >;
      "premy-dialog": DetailedHTMLProps<
        HTMLAttributes<PremyDialog>,
        PremyDialog
      >;
    }
  }
}

export * from "./PremyDialog";
