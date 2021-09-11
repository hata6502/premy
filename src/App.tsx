import {
  DialogActions,
  DialogContent,
  IconButton,
  Snackbar,
  TextField,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import type { PopperProps, SnackbarProps } from "@material-ui/core";
import {
  Alert,
  AlertTitle,
  ToggleButton,
  ToggleButtonGroup,
} from "@material-ui/lab";
import type { ToggleButtonGroupProps } from "@material-ui/lab";
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
import type { ChangeEventHandler, FunctionComponent } from "react";
import "./KanvasCanvas";
import type { KanvasCanvas, KanvasHistoryChangeEvent } from "./KanvasCanvas";
import blankPNG from "./blank.png";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import { colors } from "./colors";
import type { ColorType } from "./colors";
import { tones } from "./tones";
import type { ToneType } from "./tones";

const useStyles = makeStyles({
  actions: {
    justifyContent: "unset",
    overflowX: "auto",
    "&, & *": {
      touchAction: "unset !important",
    },
  },
  colorButtonImage: {
    width: 24,
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
  const [alertData, setAlertData] = useState<AlertData>({});

  const [brushType, setBrushType] = useState<BrushType>("light");
  const [color, setColor] = useState<ColorType>("#000000");
  const [toneType, setToneType] = useState<ToneType>("fill");

  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isRedoDisabled, setIsRedoDisabled] = useState(true);

  const kanvasCanvasElement = useRef<KanvasCanvas>(null);

  useEffect(() => {
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

    void currentKanvasCanvasElement.load({ src: src ?? blankPNG });

    return () => {
      currentKanvasCanvasElement.removeEventListener(
        "kanvasHistoryChange",
        handleCanvasHistoryChange
      );
    };
  }, [src]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setBrushType({ brushType });
    kanvasCanvasElement.current.setMode({ mode: "shape" });
  }, [brushType]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setColor({ color });
  }, [color]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setToneType({ toneType });
  }, [toneType]);

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

  const handleBrushTypeChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, brushType) => {
    if (brushType === null) {
      return;
    }

    setBrushType(brushType);
  }, []);

  const handleTextInputChange: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      if (!kanvasCanvasElement.current) {
        throw new Error("KanvasCanvas element not found");
      }

      kanvasCanvasElement.current.setText({ text: event.target.value });
    }, []);

  const handleTextInputFocus = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setMode({ mode: "text" });
  }, []);

  const handleColorChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, color) => {
    if (color === null) {
      return;
    }

    setColor(color);
  }, []);

  const handleToneTypeChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, toneType) => {
    if (toneType === null) {
      return;
    }

    setToneType(toneType);
  }, []);

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const fileReader = new FileReader();

      fileReader.addEventListener(
        "load",
        () =>
          void (async () => {
            const src = fileReader.result;

            if (typeof src !== "string") {
              throw new Error("Source is not a string");
            }

            if (!kanvasCanvasElement.current) {
              throw new Error("KanvasCanvas element not found");
            }

            await kanvasCanvasElement.current.load({ src });
          })()
      );

      fileReader.readAsDataURL(file);
    }, []);

  const handleSaveButtonClick = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    const anchorElement = document.createElement("a");

    try {
      anchorElement.download = `sketch-${Date.now()}.png`;
      anchorElement.href = kanvasCanvasElement.current.toDataURL("image/png");
      document.body.append(anchorElement);
      anchorElement.click();
    } finally {
      anchorElement.remove();
    }
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

            // @ts-expect-error ClipboardItemData is wrong.
            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard.write(data);

            setAlertData({
              isOpen: true,
              severity: "success",
              description: "Copied to clipboard.",
            });
          } catch (exception: unknown) {
            setAlertData({
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
      setAlertData((prevAlertData) => ({
        ...prevAlertData,
        isOpen: false,
      })),
    []
  );

  return (
    <>
      <DialogContent>
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

        <ToggleButtonGroup
          exclusive
          value={brushType}
          onChange={handleBrushTypeChange}
        >
          {Object.entries(brushes).map(([brushType, brush]) => (
            <ToggleButton key={brushType} value={brushType}>
              <Edit style={{ fontSize: brush.button.size }} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          variant="outlined"
          className={classes.textInput}
          label="Text"
          onChange={handleTextInputChange}
          onFocus={handleTextInputFocus}
        />

        <ToggleButtonGroup exclusive value={color} onChange={handleColorChange}>
          {Object.entries(colors).map(([colorType, color]) => (
            <ToggleButton key={colorType} value={colorType}>
              <img
                alt={colorType}
                className={classes.colorButtonImage}
                src={color.button.image}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          exclusive
          value={toneType}
          onChange={handleToneTypeChange}
        >
          {Object.entries(tones).map(([toneType, tone]) => (
            <ToggleButton key={toneType} value={toneType}>
              <img
                alt={toneType}
                className={classes.toneButtonImage}
                src={tone.button.image}
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Tooltip title="Open" PopperProps={popperProps}>
          <span>
            <IconButton component="label">
              <FolderOpen />

              <input
                type="file"
                accept="image/*"
                className={classes.fileInput}
                onChange={handleFileInputChange}
              />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Save" PopperProps={popperProps}>
          <span>
            <IconButton onClick={handleSaveButtonClick}>
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
