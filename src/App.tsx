/*
import type { KanvasHistoryChangeEvent } from "./KanvasCanvas";
import type { BrushType } from "./brushes";
import type { ColorType } from "./colors";
import type { ToneType } from "./tones";*/
import {
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import type { PopperProps } from "@material-ui/core";
import { Edit, InsertDriveFile, Redo, Undo } from "@material-ui/icons";
import { memo, useEffect, useMemo, useRef } from "react";
import type { FunctionComponent } from "react";
import "./KanvasCanvas";
import type { KanvasCanvas } from "./KanvasCanvas";
import { brushes } from "./brushes";
import { colors } from "./colors";
import { tones } from "./tones";

// TODO: remove @material/mwc-*

const useStyles = makeStyles({
  actions: {
    justifyContent: "unset",
    overflowX: "auto",
  },
  colorButtonImage: {
    width: 24,
  },
  content: {
    textAlign: "center",
  },
  textInput: {
    minWidth: 238,
  },
  toneButtonImage: {
    width: 24,
  },
});

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

  const classes = useStyles();
  const popperProps = useMemo(() => ({ container }), [container]);

  return (
    <>
      <DialogContent className={classes.content}>
        <kanvas-canvas ref={kanvasCanvasElement} />
      </DialogContent>

      <DialogActions className={classes.actions}>
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
        <TextField
          variant="outlined"
          className={classes.textInput}
          label="Text"
        />
        <Divider orientation="vertical" flexItem />
        {Object.entries(colors).map(([colorType, color]) => (
          <IconButton key={colorType}>
            <img
              alt={colorType}
              className={classes.colorButtonImage}
              src={color.button.image}
            />
          </IconButton>
        ))}
        <Divider orientation="vertical" flexItem />
        {Object.entries(tones).map(([toneType, tone]) => (
          <IconButton key={toneType}>
            <img
              alt={toneType}
              className={classes.toneButtonImage}
              src={tone.button.image}
            />
          </IconButton>
        ))}
      </DialogActions>
    </>
  );
});

export { App };
