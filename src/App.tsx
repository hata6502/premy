/*
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import { colors } from "./colors";
import type { ColorType } from "./colors";
import { tones } from "./tones";
import type { ToneType } from "./tones";*/
import "./KanvasCanvas";
import type { KanvasCanvas } from "./KanvasCanvas";
import {
  Button,
  DialogActions,
  DialogContent,
} from "@material-ui/core";
import { memo, useEffect, useRef } from "react";
import type { FunctionComponent } from "react";

// TODO: remove @material/mwc-*

const App: FunctionComponent<{
  src?: string;
}> = memo(({ src }) => {
  const kanvasCanvasElement = useRef<KanvasCanvas>(null);

  useEffect(() => {
    if (src === undefined) {
      return;
    }

    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.load({ src });
  }, [src]);

  return (
    <>
      <DialogContent>
        <kanvas-canvas ref={kanvasCanvasElement} />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" color="primary">
          Primary
        </Button>
      </DialogActions>
    </>
  );
});

export { App };
