import ColorLibrary from "color";
import {
  grey,
  brown,
  blueGrey,
  red,
  pink,
  purple,
  blue,
  cyan,
  green,
  lime,
  yellow,
  orange,
} from "@material-ui/core/colors";

export const paletteKeys = [
  "light",
  "bright",
  "vivid",
  "deep",
  "dark",
] as const;
export type PaletteKey = typeof paletteKeys[number];

export const palettes: Record<PaletteKey, string[]> = {
  light: [
    grey[50],
    blueGrey[100],
    brown[100],
    red[100],
    pink[100],
    purple[100],
    blue[100],
    cyan[100],
    green[100],
    lime[100],
    yellow[100],
    orange[100],
  ],
  bright: [
    grey.A200,
    blueGrey.A200,
    brown.A200,
    red.A200,
    pink.A200,
    purple.A200,
    blue.A200,
    cyan.A200,
    green.A200,
    lime.A200,
    yellow.A200,
    orange.A200,
  ],
  vivid: [
    // For material-ui bug.
    grey.A700,
    blueGrey.A400,
    brown.A400,
    red.A400,
    pink.A400,
    purple.A400,
    blue.A400,
    cyan.A400,
    green.A400,
    lime.A400,
    yellow.A400,
    orange.A400,
  ],
  deep: [
    grey[800],
    blueGrey[800],
    brown[800],
    red[800],
    pink[800],
    purple[800],
    blue[800],
    cyan[800],
    green[800],
    lime[800],
    yellow[800],
    orange[800],
  ],
  dark: [
    ColorLibrary(grey[900]).darken(0.5).hex(),
    ColorLibrary(blueGrey[900]).darken(0.5).hex(),
    ColorLibrary(brown[900]).darken(0.5).hex(),
    ColorLibrary(red[900]).darken(0.5).hex(),
    ColorLibrary(pink[900]).darken(0.5).hex(),
    ColorLibrary(purple[900]).darken(0.5).hex(),
    ColorLibrary(blue[900]).darken(0.5).hex(),
    ColorLibrary(cyan[900]).darken(0.5).hex(),
    ColorLibrary(green[900]).darken(0.5).hex(),
    ColorLibrary(lime[900]).darken(0.5).hex(),
    ColorLibrary(yellow[900]).darken(0.5).hex(),
    ColorLibrary(orange[900]).darken(0.5).hex(),
  ],
};

export const getBlankImageDataURL = (color: string): string => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Failed to get canvas context");
  }
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  return canvas.toDataURL();
};
