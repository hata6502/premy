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
import {
  ChangeEventHandler,
  FunctionComponent,
  MouseEventHandler,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Color } from "./Color";
import { CopyDialogContent } from "./CopyDialogContent";
import {
  HistoryDialogContent,
  HistoryDialogContentProps,
} from "./HistoryDialogContent";
import "./PremyCanvasElement";
import type {
  LoadMode,
  PremyCanvasElement,
  PremyCanvasMode,
  PremyHistoryChangeEvent,
  PremyHistoryIndexChangeEvent,
  PremyLoadStartEvent,
} from "./PremyCanvasElement";
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    transformOrigin: "top left",
    display: "flex",
    alignItems: "center",
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    background: palette.background.paper,
    borderBottom: "4px solid",
    borderImage: `linear-gradient(to right, transparent, ${palette.action.focus}) 1`,
    overflowX: "auto",
    transition: "opacity 333ms",
  },
  backdrop: {
    zIndex: zIndex.drawer + 1,
  },
  container: {
    position: "relative",
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

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [colorPopoverAnchorEl, setColorPopoverAnchorEl] = useState<Element>();
  const [fontMenuAnchorEl, setFontMenuAnchorEl] = useState<Element>();
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState<Element>();
  const [tonePopoverAnchorEl, setTonePopoverAnchorEl] = useState<Element>();

  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySource, setCopySource] = useState("");

  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const actionsElementRef = useRef<HTMLDivElement>(null);
  const premyCanvasElementRef = useRef<PremyCanvasElement>(null);

  const color = palettes[colorKey.paletteKey][colorKey.colorIndex];
  const foregroundColor =
    ColorLibrary(color).hex() === "#FAFAFA" ? "hsl(0, 0%, 75%)" : color;

  const isUndoDisabled = historyIndex < 1;
  const isRedoDisabled = historyIndex >= history.length - 1;

  useEffect(() => {
    if (!actionsElementRef.current || !visualViewport) {
      return;
    }
    const actionsElement = actionsElementRef.current;
    const viewport = visualViewport;

    let timeoutID: number | undefined;
    const handleVisualViewportChange = () => {
      actionsElement.style.opacity = "0";
      actionsElement.style.transform = `
        translate(${viewport.offsetLeft}px, ${viewport.offsetTop}px)
        scale(${1 / viewport.scale})
      `;

      clearTimeout(timeoutID);
      timeoutID = window.setTimeout(() => {
        actionsElement.style.opacity = "1";
      });
    };
    viewport.addEventListener("scroll", handleVisualViewportChange);
    viewport.addEventListener("resize", handleVisualViewportChange);

    return () => {
      viewport.removeEventListener("scroll", handleVisualViewportChange);
      viewport.removeEventListener("resize", handleVisualViewportChange);
    };
  }, []);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setFuzzinessKey(Math.random());
    }, 3000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    const currentPremyCanvasElement = premyCanvasElementRef.current;

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

    const handleCanvasHistoryChange = (event: PremyHistoryChangeEvent) => {
      setHistory(event.detail.history);
    };
    currentPremyCanvasElement.addEventListener(
      "premyHistoryChange",
      handleCanvasHistoryChange
    );

    const handleCanvasHistoryIndexChange = (
      event: PremyHistoryIndexChangeEvent
    ) => {
      setHistoryIndex(event.detail);
    };
    currentPremyCanvasElement.addEventListener(
      "premyHistoryIndexChange",
      handleCanvasHistoryIndexChange
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

      currentPremyCanvasElement.removeEventListener(
        "premyHistoryChange",
        handleCanvasHistoryChange
      );
      currentPremyCanvasElement.removeEventListener(
        "premyHistoryIndexChange",
        handleCanvasHistoryIndexChange
      );
    };
  }, []);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    const currentPremyCanvasElement = premyCanvasElementRef.current;

    if (historyProp.length) {
      currentPremyCanvasElement.setHistory(historyProp);
      currentPremyCanvasElement.setHistoryIndex(historyProp.length - 1);
    } else {
      void premyCanvasElementRef.current.load({
        src: getBlankImageDataURL(palettes.light[0]),
        constrainsAspectRatio: false,
        loadMode: "normal",
        pushesImageToHistory: true,
      });
    }
  }, [historyProp]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setBrushType({ brushType });
  }, [brushType]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setFontType({ fontType });
  }, [fontType]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setColor({ color });
  }, [color]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setMode({ mode });
  }, [mode]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setFuzziness({ fuzziness });
  }, [fuzziness]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setToneType({ toneType });
  }, [toneType]);

  useEffect(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    premyCanvasElementRef.current.setText({ text: text || defaultText });
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
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    premyCanvasElementRef.current.setHistoryIndex(historyIndex - 1);
  }, [historyIndex]);

  const handleHistoryButtonClick = useCallback(() => {
    setIsHistoryDialogOpen(true);
  }, []);

  const handleRedoButtonClick = useCallback(() => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    premyCanvasElementRef.current.setHistoryIndex(historyIndex + 1);
  }, [historyIndex]);

  const handleImportButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback((event) => setImportMenuAnchorEl(event.currentTarget), []);

  const handleImportMenuClose = useCallback(
    () => setImportMenuAnchorEl(undefined),
    []
  );

  const handleExportButtonClick: MouseEventHandler<HTMLButtonElement> =
    useCallback(async () => {
      if (!premyCanvasElementRef.current) {
        throw new Error("PremyCanvas element not found");
      }

      const blob = await new Promise<Blob | null>((resolve, reject) => {
        if (!premyCanvasElementRef.current) {
          reject(new Error("PremyCanvas element not found"));
          return;
        }

        premyCanvasElementRef.current.toBlob(resolve);
      });
      if (!blob) {
        throw new Error("Blob is not found");
      }

      const shareData = {
        files: [new File([blob], saveFileName, { type: "image/png" })],
        text: "\n#premy",
      };
      if (navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          // eslint-disable-next-line no-empty
        } catch (exception) {}
      } else {
        setCopySource(premyCanvasElementRef.current.toDataURL());
        setIsCopyDialogOpen(true);
      }
    }, []);

  const handleClearButtonClick = useCallback(async () => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    handleImportMenuClose();
    await premyCanvasElementRef.current.load({
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

          if (!premyCanvasElementRef.current) {
            throw new Error("PremyCanvas element not found");
          }

          await premyCanvasElementRef.current.load({
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
    useCallback((historyIndex) => {
      setIsHistoryDialogOpen(false);

      if (!premyCanvasElementRef.current) {
        throw new Error("PremyCanvas element not found");
      }
      premyCanvasElementRef.current.setHistoryIndex(historyIndex);
    }, []);

  const handlePaste: NonNullable<PasteDialogContentProps["onPaste"]> =
    useCallback(
      async (event) => {
        if (!premyCanvasElementRef.current) {
          throw new Error("PremyCanvas element not found");
        }

        await premyCanvasElementRef.current.load({
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
    <div className={classes.container}>
      <Box mt={8} ml={1} mr={1}>
        <premy-canvas ref={premyCanvasElementRef} />
      </Box>

      <div
        className={clsx(classes.actions, "premy-pointer-listener-ignore")}
        ref={actionsElementRef}
      >
        <Box mr={1}>
          <ToggleButtonGroup
            exclusive
            size="small"
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
      </div>

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
    </div>
  );
});
