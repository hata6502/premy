import {
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import type {
  PortalProps,
  SelectProps,
  SnackbarProps,
} from "@material-ui/core";
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
  Close,
  Edit,
  FileCopy,
  FolderOpen,
  InsertDriveFile,
  Redo,
  Save,
  Undo,
} from "@material-ui/icons";
import clsx from "clsx";
import { detect } from "detect-browser";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEventHandler,
  FunctionComponent,
  MouseEventHandler,
} from "react";
import "./KanvasCanvas";
import type { KanvasCanvas, KanvasHistoryChangeEvent } from "./KanvasCanvas";
import { PasteDialogContent } from "./PasteDialogContent";
import type { PasteDialogContentProps } from "./PasteDialogContent";
import blankPNG from "./blank.png";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import { fonts } from "./fonts";
import type { FontType } from "./fonts";
import { palettes } from "./palettes";
import { tones } from "./tones";
import type { ToneType } from "./tones";

const useStyles = makeStyles({
  actions: {
    justifyContent: "unset",
    overflowX: "auto",
    // For Smartphone
    paddingBottom: 32,
    "&, & *": {
      touchAction: "unset !important",
      "-moz-user-select": "unset !important",
      "-webkit-user-select": "unset !important",
      "-ms-user-select": "unset !important",
      userSelect: "unset !important",
    },
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fileInput: {
    display: "none",
  },
  fontTypeSelect: {
    minWidth: 112,
  },
  paletteKeySelect: {
    minWidth: 96,
  },
  textInput: {
    minWidth: 192,
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
  container?: PortalProps["container"];
  src?: string;
  onCloseButtonClick?: MouseEventHandler<HTMLButtonElement>;
}> = memo(({ container, src, onCloseButtonClick }) => {
  const [alertData, setAlertData] = useState<AlertData>({});

  const [brushType, setBrushType] = useState<BrushType>("light");
  const [colorIndex, setColorIndex] = useState(0);
  const [fontType, setFontType] = useState<FontType>("sans-serif");
  const [paletteKey, setPaletteKey] = useState<keyof typeof palettes>("bright");
  const [toneType, setToneType] = useState<ToneType>("fill");

  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isRedoDisabled, setIsRedoDisabled] = useState(true);

  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);

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

    kanvasCanvasElement.current.setFontType({ fontType });
  }, [fontType]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setColor({
      color: palettes[paletteKey][colorIndex],
    });
  }, [colorIndex, paletteKey]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setToneType({ toneType });
  }, [toneType]);

  const browser = detect();
  const classes = useStyles();

  const menuProps = useMemo(
    () => ({ className: "kanvas-pointer-listener-ignore", container }),
    [container]
  );

  const portalProps = useMemo(() => ({ container }), [container]);

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

  const handleFontTypeChange = useCallback<
    NonNullable<SelectProps["onChange"]>
  >((event) => setFontType(event.target.value as FontType), []);

  const handleColorIndexChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, index) => {
    if (index === null) {
      return;
    }

    setColorIndex(index);
  }, []);

  const handleBrushTypeChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, brushType) => {
    if (brushType === null) {
      return;
    }

    setBrushType(brushType);
  }, []);

  const handlePaletteKeyChange = useCallback<
    NonNullable<SelectProps["onChange"]>
  >((event) => setPaletteKey(event.target.value as keyof typeof palettes), []);

  const handleToneTypeChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, toneType) => {
    if (toneType === null) {
      return;
    }

    setToneType(toneType);
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

  const handleClearButtonClick = useCallback(async () => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    await kanvasCanvasElement.current.load({ src: blankPNG });
  }, []);

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const fileReader = new FileReader();

      fileReader.onload = async () => {
        const src = fileReader.result;

        if (typeof src !== "string") {
          throw new Error("Source is not a string");
        }

        if (!kanvasCanvasElement.current) {
          throw new Error("KanvasCanvas element not found");
        }

        await kanvasCanvasElement.current.load({ src });
      };

      fileReader.readAsDataURL(file);
    }, []);

  const handlePasteButtonClick = useCallback(() => {
    setIsPasteDialogOpen(true);
  }, []);

  const handleSaveButtonClick = useCallback(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    const anchorElement = document.createElement("a");

    try {
      anchorElement.download = "kanvas.png";
      anchorElement.href = kanvasCanvasElement.current.toDataURL("image/png");
      document.body.append(anchorElement);
      anchorElement.click();
    } finally {
      anchorElement.remove();
    }
  }, []);

  const handleCopyButtonClick = useCallback(() => {
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

  const handlePasteDialogClose = useCallback(() => {
    setIsPasteDialogOpen(false);
  }, []);

  const handlePaste: NonNullable<PasteDialogContentProps["onPaste"]> =
    useCallback(async (event) => {
      if (!kanvasCanvasElement.current) {
        throw new Error("KanvasCanvas element not found");
      }

      await kanvasCanvasElement.current.load(event);

      setIsPasteDialogOpen(false);
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
      <DialogContent className={classes.content}>
        <kanvas-canvas ref={kanvasCanvasElement} />
      </DialogContent>

      <DialogActions
        className={clsx(classes.actions, "kanvas-pointer-listener-ignore")}
      >
        <Tooltip title="Close" PopperProps={portalProps}>
          <span>
            <IconButton onClick={onCloseButtonClick}>
              <Close />
            </IconButton>
          </span>
        </Tooltip>

        {browser?.name !== "safari" && (
          <>
            <TextField
              variant="outlined"
              className={classes.textInput}
              label="Text"
              size="small"
              onChange={handleTextInputChange}
              onFocus={handleTextInputFocus}
            />

            <FormControl
              className={classes.fontTypeSelect}
              size="small"
              variant="outlined"
            >
              <InputLabel>Font</InputLabel>

              <Select
                label="Font"
                value={fontType}
                onChange={handleFontTypeChange}
                MenuProps={menuProps}
              >
                {Object.keys(fonts).map((fontType) => (
                  <MenuItem key={fontType} value={fontType}>
                    {fontType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <ToggleButtonGroup
          exclusive
          size="small"
          value={brushType}
          onChange={handleBrushTypeChange}
        >
          {Object.entries(brushes).map(([brushType, brush]) => (
            <ToggleButton key={brushType} value={brushType}>
              <Edit style={{ fontSize: brush.button.size }} />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={colorIndex}
          onChange={handleColorIndexChange}
        >
          {palettes[paletteKey].map((color, index) => (
            <ToggleButton key={color} value={index}>
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x={0} y={0} width={24} height={24} fill={color} />
              </svg>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <FormControl
          className={classes.paletteKeySelect}
          size="small"
          variant="outlined"
        >
          <InputLabel>Palette</InputLabel>

          <Select
            label="Palette"
            value={paletteKey}
            onChange={handlePaletteKeyChange}
            MenuProps={menuProps}
          >
            {Object.keys(palettes).map((paletteKey) => (
              <MenuItem key={paletteKey} value={paletteKey}>
                {paletteKey}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          exclusive
          size="small"
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

        <Tooltip title="Undo" PopperProps={portalProps}>
          <span>
            <IconButton
              disabled={isUndoDisabled}
              onClick={handleUndoButtonClick}
            >
              <Undo />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo" PopperProps={portalProps}>
          <span>
            <IconButton
              disabled={isRedoDisabled}
              onClick={handleRedoButtonClick}
            >
              <Redo />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Clear" PopperProps={portalProps}>
          <span>
            <IconButton onClick={handleClearButtonClick}>
              <InsertDriveFile />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Open" PopperProps={portalProps}>
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

        <Tooltip title="Paste from clipboard" PopperProps={portalProps}>
          <span>
            <IconButton onClick={handlePasteButtonClick}>
              <Assignment />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Save" PopperProps={portalProps}>
          <span>
            <IconButton onClick={handleSaveButtonClick}>
              <Save />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Copy to clipboard" PopperProps={portalProps}>
          <span>
            <IconButton onClick={handleCopyButtonClick}>
              <FileCopy />
            </IconButton>
          </span>
        </Tooltip>
      </DialogActions>

      <Dialog
        className="kanvas-pointer-listener-ignore"
        container={container}
        disableEnforceFocus
        open={isPasteDialogOpen}
        onClose={handlePasteDialogClose}
      >
        <PasteDialogContent onPaste={handlePaste} />
      </Dialog>

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
