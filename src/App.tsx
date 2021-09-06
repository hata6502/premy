/*
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";
import type { BrushType } from "./brushes";
import { colors } from "./colors";
import type { ColorType } from "./colors";
import { tones } from "./tones";
import type { ToneType } from "./tones";*/
import "./KanvasCanvas";
import type { KanvasCanvas } from "./KanvasCanvas";
import {
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Tooltip,
} from "@material-ui/core";
import type { PopperProps } from "@material-ui/core";
import { Edit, InsertDriveFile, Redo, Undo } from "@material-ui/icons";
import { memo, useEffect, useMemo, useRef } from "react";
import type { FunctionComponent } from "react";
import { brushes } from "./brushes";

// TODO: remove @material/mwc-*

const App: FunctionComponent<{
  container?: PopperProps["container"];
  src?: string;
}> = memo(({ container, src }) => {
  const kanvasCanvasElement = useRef<KanvasCanvas>(null);

  useEffect(() => {
    if (src === undefined) {
      return;
    }

    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    void kanvasCanvasElement.current.load({ src });
  }, [src]);

  const popperProps = useMemo(() => ({ container }), [container]);

  return (
    <>
      <DialogContent>
        <kanvas-canvas ref={kanvasCanvasElement} />
      </DialogContent>

      <DialogActions>
        <Tooltip title="Clear" PopperProps={popperProps}>
          <span>
            <IconButton>
              <InsertDriveFile />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Undo" PopperProps={popperProps}>
          <span>
            <IconButton>
              <Undo />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo" PopperProps={popperProps}>
          <span>
            <IconButton>
              <Redo />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem />

        {Object.entries(brushes).map(([brushType, brush]) => (
          <IconButton key={brushType}>
            <Edit style={{ fontSize: brush.button.size }} />
          </IconButton>
        ))}

        <Divider orientation="vertical" flexItem />

        <TextField variant="outlined" label="Text" />

        <Divider orientation="vertical" flexItem />
      </DialogActions>
    </>
  );
});

export { App };
