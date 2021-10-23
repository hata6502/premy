import color000000PNG from "./color000000.png";
import color555555PNG from "./color555555.png";
import colorAAAAAAPNG from "./colorAAAAAA.png";
import colorFFFFFFPNG from "./colorFFFFFF.png";
import colorFF0000PNG from "./colorFF0000.png";
import colorFFFF00PNG from "./colorFFFF00.png";
import color00FF00PNG from "./color00FF00.png";
import color00FFFFPNG from "./color00FFFF.png";
import color0000FFPNG from "./color0000FF.png";
import colorFF00FFPNG from "./colorFF00FF.png";
import colorEF8F8FPNG from "./colorEF8F8F.png";
import colorEFEF8FPNG from "./colorEFEF8F.png";
import color8FEF8FPNG from "./color8FEF8F.png";
import color8FEFEFPNG from "./color8FEFEF.png";
import color8F8FEFPNG from "./color8F8FEF.png";
import colorEF8FEFPNG from "./colorEF8FEF.png";

const colors = {
  "#000000": {
    button: {
      image: color000000PNG,
    },
  },
  "#555555": {
    button: {
      image: color555555PNG,
    },
  },
  "#aaaaaa": {
    button: {
      image: colorAAAAAAPNG,
    },
  },
  "#ffffff": {
    button: {
      image: colorFFFFFFPNG,
    },
  },
  "#ff0000": {
    button: {
      image: colorFF0000PNG,
    },
  },
  "#ffff00": {
    button: {
      image: colorFFFF00PNG,
    },
  },
  "#00ff00": {
    button: {
      image: color00FF00PNG,
    },
  },
  "#00ffff": {
    button: {
      image: color00FFFFPNG,
    },
  },
  "#0000ff": {
    button: {
      image: color0000FFPNG,
    },
  },
  "#ff00ff": {
    button: {
      image: colorFF00FFPNG,
    },
  },
  "#ef8f8f": {
    button: {
      image: colorEF8F8FPNG,
    },
  },
  "#efef8f": {
    button: {
      image: colorEFEF8FPNG,
    },
  },
  "#8fef8f": {
    button: {
      image: color8FEF8FPNG,
    },
  },
  "#8fefef": {
    button: {
      image: color8FEFEFPNG,
    },
  },
  "#8f8fef": {
    button: {
      image: color8F8FEFPNG,
    },
  },
  "#ef8fef": {
    button: {
      image: colorEF8FEFPNG,
    },
  },
};

type ColorType = keyof typeof colors;

export { colors };
export type { ColorType };
