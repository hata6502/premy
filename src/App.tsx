import {
  Backdrop,
  Box,
  CircularProgress,
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
  Apps,
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
import {
  HistoryDialogContent,
  HistoryDialogContentProps,
} from "./HistoryDialogContent";
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
import { BrushType, brushTypes, brushes } from "./brushes";
import { animalsAndNatureEmojis } from "./emoji";
import { FontType, fontTypes, fonts } from "./fonts";
import { fuzzinesses } from "./fuzziness";
import {
  PaletteKey,
  getBlankImageDataURL,
  paletteKeys,
  palettes,
} from "./palettes";
import { ToneType, toneGroups, toneTypes } from "./tones";

const useStyles = makeStyles(({ palette, zIndex }) => ({
  actions: {
    display: "flex",
    alignItems: "center",
    borderBottom: "4px solid",
    borderImage: `linear-gradient(to right, transparent, ${palette.action.focus}) 1`,
    overflowX: "auto",
  },
  backdrop: {
    zIndex: zIndex.drawer + 1,
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
}));

export const App: FunctionComponent<{
  history: string[];
  onCloseButtonClick?: MouseEventHandler<HTMLButtonElement>;
}> = memo(({ history: historyProp, onCloseButtonClick }) => {
  const [brushType, setBrushType] = useState<BrushType>(
    brushTypes[Math.floor(Math.random() * brushTypes.length)]
  );
  const [colorKey, setColorKey] = useState<{
    paletteKey: PaletteKey;
    colorIndex: number;
  }>({
    paletteKey: paletteKeys[Math.floor(Math.random() * paletteKeys.length)],
    colorIndex: Math.floor(Math.random() * palettes.light.length),
  });
  const [defaultText] = useState(
    animalsAndNatureEmojis[
      Math.floor(Math.random() * animalsAndNatureEmojis.length)
    ]
  );
  const [fontType, setFontType] = useState<FontType>(
    fontTypes[Math.floor(Math.random() * fontTypes.length)]
  );
  const [fuzziness, setFuzziness] = useState(
    fuzzinesses[Math.floor(Math.random() * fuzzinesses.length)]
  );
  const [mode, setMode] = useState<PremyCanvasMode>(
    Math.random() < 0.5 ? "text" : "shape"
  );
  const [toneType, setToneType] = useState<ToneType>(
    toneTypes[Math.floor(Math.random() * toneTypes.length)]
  );

  const [loadMode, setLoadMode] = useState<LoadMode>("normal");
  const [text, setText] = useState("");
  const [fuzzinessKey, setFuzzinessKey] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [{ history, historyIndex }, setHistory] = useState<
    PremyHistoryChangeEvent["detail"]
  >({ history: [], historyIndex: -1 });

  const [colorPopoverAnchorEl, setColorPopoverAnchorEl] = useState<Element>();
  const [fontMenuAnchorEl, setFontMenuAnchorEl] = useState<Element>();
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState<Element>();
  const [tonePopoverAnchorEl, setTonePopoverAnchorEl] = useState<Element>();

  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySource, setCopySource] = useState("");

  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const premyCanvasElement = useRef<PremyCanvas>(null);

  const color = palettes[colorKey.paletteKey][colorKey.colorIndex];
  const foregroundColor =
    ColorLibrary(color).hex() === "#FAFAFA" ? "hsl(0, 0%, 75%)" : color;

  const isUndoDisabled = historyIndex < 1;
  const isRedoDisabled = historyIndex >= history.length - 1;

  useEffect(() => {
    const intervalID = setInterval(() => {
      setFuzzinessKey(Math.random());
    }, 3000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

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
      setHistory(event.detail);
    };

    currentPremyCanvasElement.addEventListener(
      "premyHistoryChange",
      handleCanvasHistoryChange
    );

    currentPremyCanvasElement.setHistory({
      history: historyProp,
      historyIndex: historyProp.length - 1,
    });

    return () => {
      currentPremyCanvasElement.removeEventListener(
        "premyHistoryChange",
        handleCanvasHistoryChange
      );
    };
  }, [historyProp]);

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

    premyCanvasElement.current.setFuzziness({ fuzziness });
  }, [fuzziness]);

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

    premyCanvasElement.current.setText({ text: text || defaultText });
  }, [defaultText, text]);

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

  const handleHistoryButtonClick = useCallback(() => {
    setIsHistoryDialogOpen(true);
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
        text: "\n#premy",
        url: "https://premy.hata6502.com/",
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
      src: getBlankImageDataURL(color),
      constrainsAspectRatio: false,
      loadMode: "normal",
      pushesImageToHistory: true,
    });
  }, [color, handleImportMenuClose]);

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

  const handleHistoryDialogClose = useCallback(
    () => setIsHistoryDialogOpen(false),
    []
  );

  const handleCopyDialogClose = useCallback(
    () => setIsCopyDialogOpen(false),
    []
  );

  const handlePasteDialogClose = useCallback(
    () => setIsPasteDialogOpen(false),
    []
  );

  const handleSelectHistoryItem: HistoryDialogContentProps["onSelectItem"] =
    useCallback(async (dataURL) => {
      setIsHistoryDialogOpen(false);

      if (!premyCanvasElement.current) {
        throw new Error("PremyCanvas element not found");
      }
      await premyCanvasElement.current.load({
        src: dataURL,
        constrainsAspectRatio: true,
        loadMode: "normal",
        pushesImageToHistory: false,
      });
    }, []);

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
    <>
      <Box
        mt={1}
        mb={1}
        pl={1}
        pr={1}
        className={clsx(classes.actions, "premy-pointer-listener-ignore")}
      >
        <Box mr={1}>
          <ToggleButtonGroup exclusive value={mode} onChange={handleModeChange}>
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
                      // @ts-expect-error Fix paletteMatrix type.
                      paletteKey: paletteKey,
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
                  <Tone
                    color={color}
                    fuzziness={fuzziness}
                    toneType={toneType}
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
              className="premy-pointer-listener-ignore"
              onClose={handleTonePopoverClose}
            >
              <Box m={1}>
                <InputLabel shrink>Tone</InputLabel>
                {toneGroups.map((toneGroup, toneGroupIndex) => (
                  <div key={toneGroupIndex}>
                    {Object.keys(toneGroup).map((popoverToneType) => {
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
                            fuzziness={fuzzinesses[0]}
                            toneType={popoverToneType as ToneType}
                          />
                        </IconButton>
                      );
                    })}
                  </div>
                ))}

                <InputLabel shrink>Fuzziness</InputLabel>
                {fuzzinesses.map((popoverFuzziness) => {
                  const handleClick = () => {
                    setFuzziness(popoverFuzziness);
                    handleTonePopoverClose();
                  };

                  return (
                    <IconButton
                      key={fuzzinessKey + popoverFuzziness}
                      className={clsx(
                        popoverFuzziness === fuzziness &&
                          classes.selectedIconButton
                      )}
                      onClick={handleClick}
                    >
                      <Tone
                        color={color}
                        fuzziness={popoverFuzziness}
                        toneType={toneType}
                      />
                    </IconButton>
                  );
                })}
              </Box>
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
                placeholder={defaultText}
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
          <Tooltip title="History">
            <span>
              <IconButton onClick={handleHistoryButtonClick}>
                <Apps />
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

        <Box ml="auto" mr={1}>
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

        <Tooltip title="Close">
          <span>
            <IconButton onClick={onCloseButtonClick}>
              <Close />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box ml={1} mr={1}>
        <premy-canvas ref={premyCanvasElement} />
      </Box>

      <Dialog
        className="premy-pointer-listener-ignore"
        fullWidth
        maxWidth="md"
        open={isHistoryDialogOpen}
        onClose={handleHistoryDialogClose}
      >
        <HistoryDialogContent
          history={history}
          onSelectItem={handleSelectHistoryItem}
        />
      </Dialog>

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
    </>
  );
});
