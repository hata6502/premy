import {
  Box,
  Dialog,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import type { ToggleButtonGroupProps } from "@material-ui/lab";
import {
  Brush as BrushIcon,
  ChevronRight,
  Close,
  FolderOpen,
  GetApp,
  History,
  Redo,
  TextFormat,
  Undo,
} from "@material-ui/icons";
import clsx from "clsx";
import ColorLibrary from "color";
import {
  ChangeEventHandler,
  FunctionComponent,
  MouseEventHandler,
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
  PremyCanvasElement,
  PremyCanvasMode,
  PremyHistoryChangeEvent,
  PremyHistoryIndexChangeEvent,
} from "./PremyCanvasElement";
import { PasteDialogContent } from "./PasteDialogContent";
import type { PasteDialogContentProps } from "./PasteDialogContent";
import { Tone } from "./Tone";
import { VisualViewportPopover } from "./VisualViewportPopover";
import { BrushType, brushes } from "./brushes";
import { animalsAndNatureEmojis } from "./emoji";
import { FontType, fonts } from "./fonts";
import { fuzzinesses } from "./fuzziness";
import { PaletteKey, getBlankImageDataURL, palettes } from "./palettes";
import { ToneType, toneGroups } from "./tones";

const useStyles = makeStyles(({ palette, zIndex }) => ({
  actions: {
    display: "flex",
    alignItems: "center",
    width: "100vw",
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    background: palette.background.paper,
    overflowX: "auto",
    position: "relative",
  },
  scrollIndicator: {
    position: "absolute",
    right: 0,
    top: "calc(50% + 4px)",
    transform: "translateY(-50%)",
    backgroundColor: palette.background.paper,
    borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    zIndex: 1,
    animation: "$pulse 2s infinite",
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
  paletteContainer: {
    width: 240,
  },
  popover: {
    zIndex: zIndex.modal,
  },
  textInput: {
    minWidth: 80,
  },
  toneContainer: {
    width: 208,
  },
  "@keyframes pulse": {
    "0%": { transform: "translateY(-50%) translateX(0)" },
    "50%": { transform: "translateY(-50%) translateX(4px)" },
    "100%": { transform: "translateY(-50%) translateX(0)" },
  },
}));

export const App: FunctionComponent<{
  history: string[];
  onCloseButtonClick?: MouseEventHandler<HTMLButtonElement>;
}> = ({ history: historyProp, onCloseButtonClick }) => {
  const [brushType, setBrushType] = useState<BrushType>("medium");
  const [colorKey, setColorKey] = useState<{
    paletteKey: PaletteKey;
    colorIndex: number;
  }>({
    paletteKey: "bright",
    colorIndex: 4,
  });
  const [defaultText] = useState(
    animalsAndNatureEmojis[
      Math.floor(Math.random() * animalsAndNatureEmojis.length)
    ]
  );
  const [fontType, setFontType] = useState<FontType>("sans-serif");
  const [fuzziness, setFuzziness] = useState(fuzzinesses[2]);
  const [mode, setMode] = useState<PremyCanvasMode>("shape");
  const [toneType, setToneType] = useState<ToneType>("slashBold");

  const [text, setText] = useState("");
  const [fuzzinessKey, setFuzzinessKey] = useState(0);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [colorPopoverAnchorEl, setColorPopoverAnchorEl] = useState<Element>();
  const [fontMenuAnchorEl, setFontMenuAnchorEl] = useState<Element>();
  const [importMenuAnchorEl, setImportMenuAnchorEl] = useState<Element>();
  const [tonePopoverAnchorEl, setTonePopoverAnchorEl] = useState<Element>();

  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [copySource, setCopySource] = useState("");
  const [title, setTitle] = useState("");

  const [isPasteDialogOpen, setIsPasteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const actionsElementRef = useRef<HTMLDivElement>(null);
  const premyCanvasElementRef = useRef<PremyCanvasElement>(null);

  const color = palettes[colorKey.paletteKey][colorKey.colorIndex];
  const foregroundColor =
    ColorLibrary(color).hex() === "#FAFAFA" ? "hsl(0, 0%, 75%)" : color;

  const isUndoDisabled = historyIndex < 1;
  const isRedoDisabled = historyIndex >= history.length - 1;

  // スマホで画面端をお絵かきしているときに、
  // スワイプと誤判定してアプリが閉じてしまうのを防ぐ。
  useEffect(() => {
    const handleBeforeunload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeunload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
    };
  }, []);

  useEffect(() => {
    if (!actionsElementRef.current) {
      throw new Error("Actions element not found");
    }
    const actionsElement = actionsElementRef.current;

    const handleScroll = () => {
      const atStart = actionsElement.scrollLeft === 0;
      const overflowed =
        actionsElement.scrollWidth > actionsElement.clientWidth;
      setShowScrollIndicator((prev) => prev && atStart && overflowed);
    };

    actionsElement.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      actionsElement.removeEventListener("scroll", handleScroll);
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

  const classes = useStyles();

  const Brush = {
    shape: BrushIcon,
    text: TextFormat,
  }[mode];

  const paletteMatrix = palettes.vivid.map((_color, colorIndex) =>
    Object.entries(palettes).map(([paletteKey, palette]) => ({
      paletteKey,
      paletteColor: palette[colorIndex],
      colorIndex,
    }))
  );

  const handleColorButtonClick: MouseEventHandler<HTMLButtonElement> = (
    event
  ) =>
    setColorPopoverAnchorEl((prevColorPopoverAnchorEl) =>
      prevColorPopoverAnchorEl ? undefined : event.currentTarget
    );

  const handleColorPopoverClose = () => setColorPopoverAnchorEl(undefined);

  const handleModeChange: ToggleButtonGroupProps["onChange"] = (
    _event,
    mode
  ) => {
    if (mode === null) {
      return;
    }

    setMode(mode);
  };

  const handleTextInputClick = () => {
    setText(prompt("Text", text) ?? text);
  };

  const handleFontButtonClick: MouseEventHandler<HTMLButtonElement> = (event) =>
    setFontMenuAnchorEl((prevFontMenuAnchorEl) =>
      prevFontMenuAnchorEl ? undefined : event.currentTarget
    );

  const handleFontMenuClose = () => setFontMenuAnchorEl(undefined);

  const handleBrushTypeChange: ToggleButtonGroupProps["onChange"] = (
    _event,
    brushType
  ) => {
    if (brushType === null) {
      return;
    }

    setBrushType(brushType);
  };

  const handleToneButtonClick: MouseEventHandler<HTMLButtonElement> = (event) =>
    setTonePopoverAnchorEl((prevTonePopoverAnchorEl) =>
      prevTonePopoverAnchorEl ? undefined : event.currentTarget
    );

  const handleTonePopoverClose = () => setTonePopoverAnchorEl(undefined);

  const handleUndoButtonClick = () => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    premyCanvasElementRef.current.setHistoryIndex(historyIndex - 1);
  };

  const handleHistoryButtonClick = () => {
    setIsHistoryDialogOpen(true);
  };

  const handleRedoButtonClick = () => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    premyCanvasElementRef.current.setHistoryIndex(historyIndex + 1);
  };

  const handleImportButtonClick: MouseEventHandler<HTMLButtonElement> = (
    event
  ) =>
    setImportMenuAnchorEl((prevImportMenuAnchorEl) =>
      prevImportMenuAnchorEl ? undefined : event.currentTarget
    );

  const handleImportMenuClose = () => setImportMenuAnchorEl(undefined);

  const handleExportButtonClick: MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    const title = new Date().toLocaleString();
    setTitle(title);

    window.gtag?.("event", "share");

    URL.revokeObjectURL(copySource);
    const copySourceResponse = await fetch(
      premyCanvasElementRef.current.toDataURL()
    );
    setCopySource(URL.createObjectURL(await copySourceResponse.blob()));

    setIsCopyDialogOpen(true);
  };

  const handleClearButtonClick = async () => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    handleImportMenuClose();
    await premyCanvasElementRef.current.load({
      src: getBlankImageDataURL(palettes.light[0]),
      constrainsAspectRatio: false,
      pushesImageToHistory: true,
    });
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
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
        pushesImageToHistory: true,
      });
    };

    fileReader.readAsDataURL(file);
  };

  const handlePasteButtonClick = () => {
    setIsPasteDialogOpen(true);
    handleImportMenuClose();
  };

  const handlePIPButtonClick = async () => {
    handleImportMenuClose();

    const imageElement = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        if (!premyCanvasElementRef.current)
          throw new Error("PremyCanvas element not found");

        const imageElement = new Image();
        imageElement.addEventListener("error", (event) => reject(event));
        imageElement.addEventListener("load", () => resolve(imageElement));
        imageElement.src = premyCanvasElementRef.current.toDataURL();
      }
    );

    const canvas = document.createElement("canvas");
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context not found");
    context.drawImage(imageElement, 0, 0);

    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.onloadedmetadata = async () => {
      try {
        await videoElement.requestPictureInPicture();
      } catch (exception) {
        alert(exception);
        throw exception;
      }
    };
    videoElement.srcObject = canvas.captureStream();
  };

  const handleScrollIndicatorClick = () => {
    if (!actionsElementRef.current) {
      throw new Error("Actions element not found");
    }
    const actionsElement = actionsElementRef.current;

    actionsElement.scrollTo({
      left: actionsElement.scrollWidth,
      behavior: "smooth",
    });
  };

  const handleHistoryDialogClose = () => setIsHistoryDialogOpen(false);

  const handleCopyDialogClose = () => {
    setIsCopyDialogOpen(false);
  };

  const handlePasteDialogClose = () => setIsPasteDialogOpen(false);

  const handleSelectHistoryItem: HistoryDialogContentProps["onSelectItem"] = (
    historyIndex
  ) => {
    setIsHistoryDialogOpen(false);

    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }
    premyCanvasElementRef.current.setHistoryIndex(historyIndex);
  };

  const handlePaste: NonNullable<PasteDialogContentProps["onPaste"]> = async (
    event
  ) => {
    if (!premyCanvasElementRef.current) {
      throw new Error("PremyCanvas element not found");
    }

    await premyCanvasElementRef.current.load({
      src: event.src,
      constrainsAspectRatio: true,
      pushesImageToHistory: true,
    });

    setIsPasteDialogOpen(false);
  };

  return (
    <>
      <Box mt={8} ml={1} mr={1}>
        <premy-canvas ref={premyCanvasElementRef} />
      </Box>

      <VisualViewportPopover className={classes.popover}>
        <div
          ref={actionsElementRef}
          className={clsx(classes.actions, "premy-pointer-listener-ignore")}
        >
          {showScrollIndicator && (
            <IconButton
              className={classes.scrollIndicator}
              size="small"
              onClick={handleScrollIndicatorClick}
            >
              <ChevronRight />
            </IconButton>
          )}

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
            <IconButton onClick={handleColorButtonClick}>
              <Color color={color} />
            </IconButton>

            {colorPopoverAnchorEl && (
              <VisualViewportPopover
                anchorElement={colorPopoverAnchorEl}
                className={classes.popover}
                onClose={handleColorPopoverClose}
              >
                <Paper
                  className={clsx(
                    classes.paletteContainer,
                    "premy-pointer-listener-ignore"
                  )}
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
                </Paper>
              </VisualViewportPopover>
            )}
          </Box>

          {mode === "shape" && (
            <Box mr={1}>
              <IconButton onClick={handleToneButtonClick}>
                <Tone color={color} fuzziness={fuzziness} toneType={toneType} />
              </IconButton>

              {tonePopoverAnchorEl && (
                <VisualViewportPopover
                  anchorElement={tonePopoverAnchorEl}
                  className={classes.popover}
                  onClose={handleTonePopoverClose}
                >
                  <Paper
                    className={clsx(
                      classes.toneContainer,
                      "premy-pointer-listener-ignore"
                    )}
                  >
                    <Box p={1}>
                      <InputLabel shrink>トーン</InputLabel>
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

                      <InputLabel shrink>エントロピー</InputLabel>
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
                  </Paper>
                </VisualViewportPopover>
              )}
            </Box>
          )}

          {mode === "text" && (
            <>
              <Box mr={1}>
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

                {fontMenuAnchorEl && (
                  <VisualViewportPopover
                    anchorElement={fontMenuAnchorEl}
                    className={classes.popover}
                    onClose={handleFontMenuClose}
                  >
                    <Paper className="premy-pointer-listener-ignore">
                      {Object.keys(fonts).map((menuFontType) => {
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
                    </Paper>
                  </VisualViewportPopover>
                )}
              </Box>

              <Box mr={1}>
                <TextField
                  variant="outlined"
                  className={classes.textInput}
                  placeholder={defaultText}
                  size="small"
                  value={text}
                  onClick={handleTextInputClick}
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
            <IconButton
              disabled={isUndoDisabled}
              onClick={handleUndoButtonClick}
            >
              <Undo />
            </IconButton>
          </Box>

          <Box mr={1}>
            <IconButton onClick={handleHistoryButtonClick}>
              <History />
            </IconButton>
          </Box>

          <Box mr={1}>
            <IconButton
              disabled={isRedoDisabled}
              onClick={handleRedoButtonClick}
            >
              <Redo />
            </IconButton>
          </Box>

          <Box ml="auto" mr={1}>
            <IconButton onClick={handleImportButtonClick}>
              <FolderOpen />
            </IconButton>

            {importMenuAnchorEl && (
              <VisualViewportPopover
                anchorElement={importMenuAnchorEl}
                className={classes.popover}
                onClose={handleImportMenuClose}
              >
                <Paper className="premy-pointer-listener-ignore">
                  <MenuItem onClick={handleClearButtonClick}>
                    白紙に戻す
                  </MenuItem>

                  <MenuItem component="label">
                    画像ファイルを開く
                    <input
                      type="file"
                      accept="image/*"
                      className={classes.fileInput}
                      onChange={handleFileInputChange}
                    />
                  </MenuItem>

                  <MenuItem onClick={handlePasteButtonClick}>
                    画像をペーストする
                  </MenuItem>

                  <MenuItem onClick={handlePIPButtonClick}>
                    お題を置く (beta)
                  </MenuItem>
                </Paper>
              </VisualViewportPopover>
            )}
          </Box>

          <Box mr={1}>
            <IconButton onClick={handleExportButtonClick}>
              <GetApp />
            </IconButton>
          </Box>

          <IconButton onClick={onCloseButtonClick}>
            <Close />
          </IconButton>
        </div>
      </VisualViewportPopover>

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
        <CopyDialogContent title={title} src={copySource} />
      </Dialog>

      <Dialog
        className="premy-pointer-listener-ignore"
        open={isPasteDialogOpen}
        onClose={handlePasteDialogClose}
      >
        <PasteDialogContent onPaste={handlePaste} />
      </Dialog>
    </>
  );
};
