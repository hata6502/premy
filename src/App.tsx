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
  Snackbar,
  TextField,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import type { PopperProps, SnackbarProps } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import type { AlertProps, AlertTitleProps } from "@material-ui/lab";
import {
  Assignment,
  Edit,
  FolderOpen,
  InsertDriveFile,
  Redo,
  Save,
  Undo,
} from "@material-ui/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  fileInput: {
    display: "none",
  },
  textInput: {
    minWidth: 238,
  },
  toneButtonImage: {
    width: 24,
  },
});

interface AlertData {
  isOpen?: SnackbarProps["open"];
  severity?: AlertProps["severity"];
  title?: AlertTitleProps["children"];
  description?: AlertProps["children"];
}

const App: FunctionComponent<{
  container?: PopperProps["container"];
  src?: string;
}> = memo(({ container, src }) => {
  const [alertData, dispatchAlertData] = useState<AlertData>({});
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

  const handleAlertClose = useCallback(
    () =>
      dispatchAlertData((prevAlertData) => ({
        ...prevAlertData,
        isOpen: false,
      })),
    []
  );

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

        <Divider orientation="vertical" flexItem />

        <Tooltip title="Open" PopperProps={popperProps}>
          <span>
            <IconButton component="label">
              <FolderOpen />
              <input
                type="file"
                accept="image/*"
                className={classes.fileInput}
              />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Save" PopperProps={popperProps}>
          <span>
            <IconButton>
              <Save />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Copy to clipboard" PopperProps={popperProps}>
          <span>
            <IconButton>
              <Assignment />
            </IconButton>
          </span>
        </Tooltip>
      </DialogActions>

      <Snackbar open={alertData.isOpen}>
        <Alert severity={alertData.severity} onClose={handleAlertClose}>
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.description}
        </Alert>
      </Snackbar>
    </>
  );
});

export { App };
