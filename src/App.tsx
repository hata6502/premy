/*
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
import type { KanvasCanvas, KanvasHistoryChangeEvent } from "./KanvasCanvas";
import { brushes } from "./brushes";
import { colors } from "./colors";
import { tones } from "./tones";

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

  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isRedoDisabled, setIsRedoDisabled] = useState(true);

  const kanvasCanvasElement = useRef<KanvasCanvas>(null);

  useEffect(() => {
    if (src === undefined) {
      return;
    }

    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    const currentKanvasCanvasElement = kanvasCanvasElement.current;

    const handleCanvasHistoryChange = (event: KanvasHistoryChangeEvent) => {
      setIsUndoDisabled(event.detail.historyIndex < 1);
      setIsRedoDisabled(
        event.detail.historyIndex >= event.detail.history.length - 1
      );
    };

    currentKanvasCanvasElement.addEventListener(
      "kanvasHistoryChange",
      handleCanvasHistoryChange
    );

    void currentKanvasCanvasElement.load({ src });

    return () => {
      currentKanvasCanvasElement.removeEventListener(
        "kanvasHistoryChange",
        handleCanvasHistoryChange
      );
    };
  }, [src]);

  const classes = useStyles();
  const popperProps = useMemo(() => ({ container }), [container]);

  const handleClearButtonClick = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.clear();
  }, []);

  const handleUndoButtonClick = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.undo();
  }, []);

  const handleRedoButtonClick = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.redo();
  }, []);

  const handleCopyToClipboardButtonClick = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.toBlob(
      (blob) =>
        void (async () => {
          try {
            if (!blob) {
              throw new Error("Blob is null");
            }

            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard.write(data);

            dispatchAlertData({
              isOpen: true,
              severity: "success",
              description: "Copied to clipboard.",
            });
          } catch (exception: unknown) {
            dispatchAlertData({
              isOpen: true,
              severity: "error",
              description: "Failed to copy.",
            });

            throw exception;
          }
        })()
    );
  }, []);

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
            <IconButton onClick={handleClearButtonClick}>
              <InsertDriveFile />
            </IconButton>
          </span>
        </Tooltip>
        <Divider orientation="vertical" flexItem />

        <Tooltip title="Undo" PopperProps={popperProps}>
          <span>
            <IconButton
              disabled={isUndoDisabled}
              onClick={handleUndoButtonClick}
            >
              <Undo />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo" PopperProps={popperProps}>
          <span>
            <IconButton
              disabled={isRedoDisabled}
              onClick={handleRedoButtonClick}
            >
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
            <IconButton onClick={handleCopyToClipboardButtonClick}>
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
