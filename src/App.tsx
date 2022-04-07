import {
  Box,
  Container,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Snackbar,
  TextField,
  Tooltip,
  makeStyles,
} from "@material-ui/core";
import type { SnackbarProps } from "@material-ui/core";
import {
  Alert,
  AlertTitle,
  ToggleButton,
  ToggleButtonGroup,
} from "@material-ui/lab";
import type { ToggleButtonGroupProps } from "@material-ui/lab";
import type { AlertProps, AlertTitleProps } from "@material-ui/lab";
import {
  Brush as BrushIcon,
  Close,
  GetApp,
  Publish,
  Redo,
  TextFormat,
  Undo,
} from "@material-ui/icons";
import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type {
  ChangeEventHandler,
  FunctionComponent,
  MouseEventHandler,
} from "react";
import { Color } from "./Color";
import "./KanvasCanvas";
import type {
  KanvasCanvas,
  KanvasCanvasMode,
  KanvasHistoryChangeEvent,
} from "./KanvasCanvas";
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
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  closeButton: {
    marginLeft: "auto",
  },
  fileInput: {
    display: "none !important",
  },
  fontButton: {
    width: 48,
    height: 48,
  },
  selectedIconButton: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: "unset",
  },
  textInput: {
    minWidth: 128,
  },
  tonePopover: {
    maxWidth: 336,
  },
});

interface AlertData {
  isOpen?: SnackbarProps["open"];
  severity?: AlertProps["severity"];
  title?: AlertTitleProps["children"];
  description?: AlertProps["children"];
}

const App: FunctionComponent<{
  src?: string;
  onCloseButtonClick?: MouseEventHandler<HTMLButtonElement>;
}> = memo(({ src, onCloseButtonClick }) => {
  const [alertData, setAlertData] = useState<AlertData>({});

  const [brushType, setBrushType] = useState<BrushType>("medium");
  const [colorKey, setColorKey] = useState<{
    paletteKey: keyof typeof palettes;
    colorIndex: number;
  }>({
    paletteKey: "deep",
    colorIndex: 0,
  });
  const color = palettes[colorKey.paletteKey][colorKey.colorIndex];
  const [fontType, setFontType] = useState<FontType>("sans-serif");
  const [mode, setMode] = useState<KanvasCanvasMode>("shape");
  const [text, setText] = useState("");
  const [toneType, setToneType] = useState<ToneType>("dotBold");

  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isRedoDisabled, setIsRedoDisabled] = useState(true);

  const [colorPopoverAnchorEl, setColorPopoverAnchorEl] = useState<Element>();
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<Element>();
  const [fontMenuAnchorEl, setFontMenuAnchorEl] = useState<Element>();
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState<Element>();
  const [tonePopoverAnchorEl, setTonePopoverAnchorEl] = useState<Element>();

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

    void currentKanvasCanvasElement.load({
      src: src ?? blankPNG,
      pushesImageToHistory: true,
    });

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

    kanvasCanvasElement.current.setColor({ color });
  }, [color]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setMode({ mode });
  }, [mode]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setToneType({ toneType });
  }, [toneType]);

  useEffect(() => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    kanvasCanvasElement.current.setText({ text: text || "👒" });
  }, [text]);

  const classes = useStyles();

  const Brush = {
    shape: BrushIcon,
    text: TextFormat,
  }[mode];

  const handleColorButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setColorPopoverAnchorEl(event.currentTarget), []);

  const handleColorPopoverClose = useCallback(
    () => setColorPopoverAnchorEl(undefined),
    []
  );

  const handleModeChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, mode) => {
    if (mode === null) {
      return;
    }

    setMode(mode);
  }, []);

  const handleTextInputChange: ChangeEventHandler<HTMLInputElement> =
    useCallback((event) => setText(event.target.value), []);

  const handleFontButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setFontMenuAnchorEl(event.currentTarget), []);

  const handleFontMenuClose = useCallback(
    () => setFontMenuAnchorEl(undefined),
    []
  );

  const handleBrushTypeChange = useCallback<
    NonNullable<ToggleButtonGroupProps["onChange"]>
  >((_event, brushType) => {
    if (brushType === null) {
      return;
    }

    setBrushType(brushType);
  }, []);

  const handleToneButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setTonePopoverAnchorEl(event.currentTarget), []);

  const handleTonePopoverClose = useCallback(
    () => setTonePopoverAnchorEl(undefined),
    []
  );

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

  const handleImportButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setImportMenuAnchorEl(event.currentTarget), []);

  const handleImportMenuClose = useCallback(
    () => setImportMenuAnchorEl(undefined),
    []
  );

  const handleExportButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setExportMenuAnchorEl(event.currentTarget), []);

  const handleExportMenuClose = useCallback(
    () => setExportMenuAnchorEl(undefined),
    []
  );

  const handleClearButtonClick = useCallback(async () => {
    if (!kanvasCanvasElement.current) {
      throw new Error("KanvasCanvas element not found");
    }

    handleImportMenuClose();
    await kanvasCanvasElement.current.load({
      src: blankPNG,
      pushesImageToHistory: true,
    });
  }, [handleImportMenuClose]);

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (event) => {
        handleImportMenuClose();

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

          await kanvasCanvasElement.current.load({
            src,
            pushesImageToHistory: true,
          });
        };

        fileReader.readAsDataURL(file);
      },
      [handleImportMenuClose]
    );

  const handlePasteButtonClick = useCallback(() => {
    setIsPasteDialogOpen(true);
    handleImportMenuClose();
  }, [handleImportMenuClose]);

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

    handleExportMenuClose();
  }, [handleExportMenuClose]);

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

    handleExportMenuClose();
  }, [handleExportMenuClose]);

  const handlePasteDialogClose = useCallback(
    () => setIsPasteDialogOpen(false),
    []
  );

  const handlePaste: NonNullable<PasteDialogContentProps["onPaste"]> =
    useCallback(async (event) => {
      if (!kanvasCanvasElement.current) {
        throw new Error("KanvasCanvas element not found");
      }

      await kanvasCanvasElement.current.load({
        src: event.src,
        pushesImageToHistory: true,
      });

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
    <Container>
      <Box ml={1} mr={1}>
        <div
          className={clsx(classes.actions, "kanvas-pointer-listener-ignore")}
        >
          <Box mr={1}>
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={handleModeChange}
            >
              <ToggleButton value="shape">
                <BrushIcon />
              </ToggleButton>

              <ToggleButton value="text">
                <TextFormat />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box mr={1}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={brushType}
              onChange={handleBrushTypeChange}
            >
              {Object.entries(brushes).map(([brushType, brush]) => (
                <ToggleButton key={brushType} value={brushType}>
                  <Brush style={{ fontSize: brush.button.size }} />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box mr={1}>
            <Tooltip title="Color">
              <span>
                <IconButton onClick={handleColorButtonClick}>
                  <Color color={color} />
                </IconButton>
              </span>
            </Tooltip>

            <Popover
              open={Boolean(colorPopoverAnchorEl)}
              anchorEl={colorPopoverAnchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              className="kanvas-pointer-listener-ignore"
              onClose={handleColorPopoverClose}
            >
              {Object.entries(palettes).map(([paletteKey, palette]) => (
                <div key={paletteKey}>
                  {palette.map((paletteColor, colorIndex) => {
                    // TODO: useCallback
                    const handleClick = () => {
                      setColorKey({
                        paletteKey: paletteKey as keyof typeof palettes,
                        colorIndex,
                      });

                      handleColorPopoverClose();
                    };

                    return (
                      <IconButton
                        key={paletteColor}
                        className={clsx(
                          (paletteKey === colorKey.paletteKey ||
                            colorIndex === colorKey.colorIndex) &&
                            classes.selectedIconButton
                        )}
                        onClick={handleClick}
                      >
                        <Color color={paletteColor} />
                      </IconButton>
                    );
                  })}
                </div>
              ))}
            </Popover>
          </Box>

          {mode === "shape" && (
            <Box mr={1}>
              <Tooltip title="Tone">
                <span>
                  <IconButton onClick={handleToneButtonClick}>
                    <img
                      alt={toneType}
                      src={tones[toneType].button.image}
                      width={24}
                    />
                  </IconButton>
                </span>
              </Tooltip>

              <Popover
                open={Boolean(tonePopoverAnchorEl)}
                anchorEl={tonePopoverAnchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                className="kanvas-pointer-listener-ignore"
                onClose={handleTonePopoverClose}
                PaperProps={{
                  className: classes.tonePopover,
                }}
              >
                {Object.entries(tones).map(([popoverToneType, popoverTone]) => {
                  // TODO: useCallback
                  const handleClick = () => {
                    setToneType(popoverToneType as ToneType);
                    handleTonePopoverClose();
                  };

                  return (
                    <IconButton
                      key={popoverToneType}
                      className={clsx(
                        popoverToneType === toneType &&
                          classes.selectedIconButton
                      )}
                      onClick={handleClick}
                    >
                      <img
                        alt={popoverToneType}
                        src={popoverTone.button.image}
                        width={24}
                      />
                    </IconButton>
                  );
                })}
              </Popover>
            </Box>
          )}

          {mode === "text" && (
            <>
              <Box mr={1}>
                <TextField
                  variant="outlined"
                  className={classes.textInput}
                  placeholder="👒"
                  size="small"
                  value={text}
                  onChange={handleTextInputChange}
                />
              </Box>

              <Box mr={1}>
                <Tooltip title="Font">
                  <span>
                    <IconButton
                      className={classes.fontButton}
                      onClick={handleFontButtonClick}
                    >
                      <span
                        style={{
                          fontFamily: fonts[fontType],
                          fontWeight: "bold",
                        }}
                      >
                        F
                      </span>
                    </IconButton>
                  </span>
                </Tooltip>

                <Menu
                  open={Boolean(fontMenuAnchorEl)}
                  anchorEl={fontMenuAnchorEl}
                  className="kanvas-pointer-listener-ignore"
                  onClose={handleFontMenuClose}
                >
                  {Object.keys(fonts).map((menuFontType) => {
                    // TODO: useCallback
                    const handleClick = () => {
                      setFontType(menuFontType as FontType);
                      handleFontMenuClose();
                    };

                    return (
                      <MenuItem
                        key={menuFontType}
                        selected={fontType === menuFontType}
                        onClick={handleClick}
                      >
                        {menuFontType}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </Box>
            </>
          )}

          <Box mr={1}>
            <Tooltip title="Undo">
              <span>
                <IconButton
                  disabled={isUndoDisabled}
                  onClick={handleUndoButtonClick}
                >
                  <Undo />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Box mr={1}>
            <Tooltip title="Redo">
              <span>
                <IconButton
                  disabled={isRedoDisabled}
                  onClick={handleRedoButtonClick}
                >
                  <Redo />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Box mr={1}>
            <Tooltip title="Import">
              <span>
                <IconButton onClick={handleImportButtonClick}>
                  <GetApp />
                </IconButton>
              </span>
            </Tooltip>

            <Menu
              open={Boolean(importMenuAnchorEl)}
              anchorEl={importMenuAnchorEl}
              className="kanvas-pointer-listener-ignore"
              onClose={handleImportMenuClose}
            >
              <MenuItem onClick={handleClearButtonClick}>Clear</MenuItem>

              <MenuItem component="label">
                Load from file
                <input
                  type="file"
                  accept="image/*"
                  className={classes.fileInput}
                  onChange={handleFileInputChange}
                />
              </MenuItem>

              <MenuItem onClick={handlePasteButtonClick}>
                Paste from clipboard
              </MenuItem>
            </Menu>
          </Box>

          <Box mr={1}>
            <Tooltip title="Export">
              <span>
                <IconButton onClick={handleExportButtonClick}>
                  <Publish />
                </IconButton>
              </span>
            </Tooltip>

            <Menu
              open={Boolean(exportMenuAnchorEl)}
              anchorEl={exportMenuAnchorEl}
              className="kanvas-pointer-listener-ignore"
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={handleSaveButtonClick}>Save as file</MenuItem>
              <MenuItem onClick={handleCopyButtonClick}>
                Copy to clipboard
              </MenuItem>
            </Menu>
          </Box>

          <div className={classes.closeButton}>
            <Tooltip title="Close">
              <span>
                <IconButton onClick={onCloseButtonClick}>
                  <Close />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        </div>

        <kanvas-canvas ref={kanvasCanvasElement} />
      </Box>

      <Dialog
        className="kanvas-pointer-listener-ignore"
        open={isPasteDialogOpen}
        onClose={handlePasteDialogClose}
      >
        <PasteDialogContent onPaste={handlePaste} />
      </Dialog>

      <Snackbar
        open={alertData.isOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert severity={alertData.severity} onClose={handleAlertClose}>
          <AlertTitle>{alertData.title}</AlertTitle>
          {alertData.description}
        </Alert>
      </Snackbar>
    </Container>
  );
});

export { App };
