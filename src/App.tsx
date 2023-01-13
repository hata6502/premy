import {
  Backdrop,
  Box,
  CircularProgress,
  Container,
  Dialog,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Popover,
  Select,
  SelectProps,
  TextField,
  Tooltip,
  makeStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import type { ToggleButtonGroupProps } from "@material-ui/lab";
import {
  Brush as BrushIcon,
  Close,
  FolderOpen,
  Redo,
  Share,
  TextFormat,
  Undo,
} from "@material-ui/icons";
import clsx from "clsx";
import ColorLibrary from "color";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type {
  ChangeEventHandler,
  FunctionComponent,
  MouseEventHandler,
} from "react";
import { Color } from "./Color";
import { CopyDialogContent } from "./CopyDialogContent";
import "./PremyCanvas";
import type {
  LoadMode,
  PremyCanvas,
  PremyCanvasMode,
  PremyHistoryChangeEvent,
  PremyLoadStartEvent,
} from "./PremyCanvas";
import { PasteDialogContent } from "./PasteDialogContent";
import type { PasteDialogContentProps } from "./PasteDialogContent";
import { Tone } from "./Tone";
import { brushes } from "./brushes";
import type { BrushType } from "./brushes";
import { fonts } from "./fonts";
import type { FontType } from "./fonts";
import { palettes } from "./palettes";
import { tones } from "./tones";
import type { ToneType } from "./tones";

const blankImageDataURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

const useStyles = makeStyles(({ zIndex }) => ({
  actions: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 16,
  },
  backdrop: {
    zIndex: zIndex.drawer + 1,
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
    minWidth: 80,
  },
  tonePopover: {
    maxWidth: 336,
  },
}));

const App: FunctionComponent<{
  src?: string;
  onCloseButtonClick?: MouseEventHandler<HTMLButtonElement>;
}> = memo(({ src, onCloseButtonClick }) => {
  const [brushType, setBrushType] = useState<BrushType>("xLarge");
  const [colorKey, setColorKey] = useState<{
    paletteKey: keyof typeof palettes;
    colorIndex: number;
  }>({
    paletteKey: "light",
    colorIndex: 4,
  });
  const [fontType, setFontType] = useState<FontType>("sans-serif");
  const [loadMode, setLoadMode] = useState<LoadMode>("normal");
  const [mode, setMode] = useState<PremyCanvasMode>("shape");
  const [text, setText] = useState("");
  const [toneType, setToneType] = useState<ToneType>("slashLight");

  const [isLoading, setIsLoading] = useState(false);

  const [isUndoDisabled, setIsUndoDisabled] = useState(true);
  const [isRedoDisabled, setIsRedoDisabled] = useState(true);

  const [colorPopoverAnchorEl, setColorPopoverAnchorEl] = useState<Element>();
  const [fontMenuAnchorEl, setFontMenuAnchorEl] = useState<Element>();
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState<Element>();
  const [tonePopoverAnchorEl, setTonePopoverAnchorEl] = useState<Element>();

  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySource, setCopySource] = useState("");

  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);

  const premyCanvasElement = useRef<PremyCanvas>(null);

  const color = palettes[colorKey.paletteKey][colorKey.colorIndex];
  const foregroundColor =
    ColorLibrary(color).hex() === "#FFFFFF" ? "hsl(0, 0%, 75%)" : color;

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    const currentPremyCanvasElement = premyCanvasElement.current;

    const handleCanvasLoadStart = (event: PremyLoadStartEvent) => {
      if (event.detail.isHeavy) {
        setIsLoading(true);
      }
    };

    currentPremyCanvasElement.addEventListener(
      "premyLoadStart",
      handleCanvasLoadStart
    );

    const handleCanvasLoadEnd = () => setIsLoading(false);

    currentPremyCanvasElement.addEventListener(
      "premyLoadEnd",
      handleCanvasLoadEnd
    );

    return () => {
      currentPremyCanvasElement.removeEventListener(
        "premyLoadStart",
        handleCanvasLoadStart
      );

      currentPremyCanvasElement.removeEventListener(
        "premyLoadEnd",
        handleCanvasLoadEnd
      );
    };
  }, []);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    const currentPremyCanvasElement = premyCanvasElement.current;

    const handleCanvasHistoryChange = (event: PremyHistoryChangeEvent) => {
      setIsUndoDisabled(event.detail.historyIndex < 1);
      setIsRedoDisabled(
        event.detail.historyIndex >= event.detail.history.length - 1
      );
    };

    currentPremyCanvasElement.addEventListener(
      "premyHistoryChange",
      handleCanvasHistoryChange
    );

    void currentPremyCanvasElement.load({
      src: src ?? blankImageDataURL,
      constrainsAspectRatio: Boolean(src),
      loadMode: "normal",
      pushesImageToHistory: true,
    });

    return () => {
      currentPremyCanvasElement.removeEventListener(
        "premyHistoryChange",
        handleCanvasHistoryChange
      );
    };
  }, [src]);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.setBrushType({ brushType });
  }, [brushType]);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.setFontType({ fontType });
  }, [fontType]);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.setColor({ color });
  }, [color]);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.setMode({ mode });
  }, [mode]);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.setToneType({ toneType });
  }, [toneType]);

  useEffect(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.setText({ text: text || "👒" });
  }, [text]);

  const saveFileName = "premy.png";

  const theme = useTheme();
  const isUpSM = useMediaQuery(theme.breakpoints.up("sm"));
  const classes = useStyles();

  const Brush = {
    shape: BrushIcon,
    text: TextFormat,
  }[mode];

  const landscapePaletteMatrix = Object.entries(palettes).map(
    ([paletteKey, palette]) =>
      palette.map((paletteColor, colorIndex) => ({
        paletteKey,
        paletteColor,
        colorIndex,
      }))
  );

  const portraitPaletteMatrix = palettes.vivid.map((_color, colorIndex) =>
    Object.entries(palettes).map(([paletteKey, palette]) => ({
      paletteKey,
      paletteColor: palette[colorIndex],
      colorIndex,
    }))
  );

  const paletteMatrix = isUpSM ? landscapePaletteMatrix : portraitPaletteMatrix;

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
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.undo();
  }, []);

  const handleRedoButtonClick = useCallback(() => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElement.current.redo();
  }, []);

  const handleImportButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setImportMenuAnchorEl(event.currentTarget), []);

  const handleImportMenuClose = useCallback(
    () => setImportMenuAnchorEl(undefined),
    []
  );

  const handleExportButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback(async () => {
      if (!premyCanvasElement.current) {
        throw new Error("PremyCanvas element not found");
      }

      const blob = await new Promise<Blob | null>((resolve, reject) => {
        if (!premyCanvasElement.current) {
          reject(new Error("PremyCanvas element not found"));
          return;
        }

        premyCanvasElement.current.toBlob(resolve);
      });

      if (!blob) {
        throw new Error("Blob is not found");
      }

      const shareData = {
        files: [new File([blob], saveFileName, { type: "image/png" })],
        text: " #premy ",
      };

      if (navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          // eslint-disable-next-line no-empty
        } catch (exception) {}
      } else {
        setCopySource(premyCanvasElement.current.toDataURL());
        setIsCopyDialogOpen(true);
      }
    }, []);

  const handleClearButtonClick = useCallback(async () => {
    if (!premyCanvasElement.current) {
      throw new Error("PremyCanvas element not found");
    }

    handleImportMenuClose();
    await premyCanvasElement.current.load({
      src: blankImageDataURL,
      constrainsAspectRatio: false,
      loadMode: "normal",
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

          if (!premyCanvasElement.current) {
            throw new Error("PremyCanvas element not found");
          }

          await premyCanvasElement.current.load({
            src,
            constrainsAspectRatio: true,
            loadMode,
            pushesImageToHistory: true,
          });
        };

        fileReader.readAsDataURL(file);
      },
      [handleImportMenuClose, loadMode]
    );

  const handlePasteButtonClick = useCallback(() => {
    setIsPasteDialogOpen(true);
    handleImportMenuClose();
  }, [handleImportMenuClose]);

  const handleLoadModeSelectChange = useCallback<
    NonNullable<SelectProps["onChange"]>
  >((event) => {
    setLoadMode(event.target.value as LoadMode);
  }, []);

  const handleCopyDialogClose = useCallback(
    () => setIsCopyDialogOpen(false),
    []
  );

  const handlePasteDialogClose = useCallback(
    () => setIsPasteDialogOpen(false),
    []
  );

  const handlePaste: NonNullable<PasteDialogContentProps["onPaste"]> =
    useCallback(
      async (event) => {
        if (!premyCanvasElement.current) {
          throw new Error("PremyCanvas element not found");
        }

        await premyCanvasElement.current.load({
          src: event.src,
          constrainsAspectRatio: true,
          loadMode,
          pushesImageToHistory: true,
        });

        setIsPasteDialogOpen(false);
      },
      [loadMode]
    );

  return (
    <Container>
      <Box ml={1} mr={1}>
        <div className={clsx(classes.actions, "premy-pointer-listener-ignore")}>
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
              className="premy-pointer-listener-ignore"
              onClose={handleColorPopoverClose}
            >
              {paletteMatrix.map((row, rowIndex) => (
                <div key={rowIndex}>
                  {row.map(({ paletteKey, paletteColor, colorIndex }) => {
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
                    <Tone color={color} toneType={toneType} />
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
                className="premy-pointer-listener-ignore"
                onClose={handleTonePopoverClose}
                PaperProps={{
                  className: classes.tonePopover,
                }}
              >
                {Object.keys(tones).map((popoverToneType) => {
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
                      <Tone
                        color={color}
                        toneType={popoverToneType as ToneType}
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
                  className="premy-pointer-listener-ignore"
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

              <Box mr={1}>
                <TextField
                  variant="outlined"
                  className={classes.textInput}
                  placeholder="👒"
                  size="small"
                  value={text}
                  onChange={handleTextInputChange}
                  inputProps={{
                    style: {
                      color: foregroundColor,
                      fontFamily: fonts[fontType],
                    },
                  }}
                />
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
            <Tooltip title="Open">
              <span>
                <IconButton onClick={handleImportButtonClick}>
                  <FolderOpen />
                </IconButton>
              </span>
            </Tooltip>

            <Menu
              open={Boolean(importMenuAnchorEl)}
              anchorEl={importMenuAnchorEl}
              className="premy-pointer-listener-ignore"
              onClose={handleImportMenuClose}
            >
              <MenuItem>
                <FormControl>
                  <InputLabel>Filter</InputLabel>

                  <Select
                    native
                    value={loadMode}
                    onChange={handleLoadModeSelectChange}
                  >
                    <option value="normal">normal</option>
                    <option value="tracing">Tracing filter</option>
                    <option value="mibae">Mibae filter (beta)</option>
                  </Select>
                </FormControl>
              </MenuItem>

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
            <Tooltip title="Share">
              <span>
                <IconButton onClick={handleExportButtonClick}>
                  <Share />
                </IconButton>
              </span>
            </Tooltip>
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

        <premy-canvas ref={premyCanvasElement} />
      </Box>

      <Dialog
        className="premy-pointer-listener-ignore"
        open={isCopyDialogOpen}
        onClose={handleCopyDialogClose}
      >
        <CopyDialogContent src={copySource} />
      </Dialog>

      <Dialog
        className="premy-pointer-listener-ignore"
        open={isPasteDialogOpen}
        onClose={handlePasteDialogClose}
      >
        <PasteDialogContent onPaste={handlePaste} />
      </Dialog>

      <Backdrop
        className={clsx("premy-pointer-listener-ignore", classes.backdrop)}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>
    </Container>
  );
});

export { App };
