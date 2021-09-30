import color000000PNG from "./color000000.png";
import colorFF0000PNG from "./colorFF0000.png";
import color00FF00PNG from "./color00FF00.png";
import color0000FFPNG from "./color0000FF.png";
import colorFFFF00PNG from "./colorFFFF00.png";
import colorFF00FFPNG from "./colorFF00FF.png";
import color00FFFFPNG from "./color00FFFF.png";
import colorEF8F8FPNG from "./colorEF8F8F.png";
import color8FEF8FPNG from "./color8FEF8F.png";
import color8F8FEFPNG from "./color8F8FEF.png";
import colorEFEF8FPNG from "./colorEFEF8F.png";
import colorEF8FEFPNG from "./colorEF8FEF.png";
import color8FEFEFPNG from "./color8FEFEF.png";
import colorFFFFFFPNG from "./colorFFFFFF.png";

const colors = {
  "#000000": {
    button: {
      image: color000000PNG,
    },
  },
  "#ff0000": {
    button: {
      image: colorFF0000PNG,
    },
  },
  "#00ff00": {
    button: {
      image: color00FF00PNG,
    },
  },
  "#0000ff": {
    button: {
      image: color0000FFPNG,
    },
  },
  "#ffff00": {
    button: {
      image: colorFFFF00PNG,
    },
  },
  "#ff00ff": {
    button: {
      image: colorFF00FFPNG,
    },
  },
  "#00ffff": {
    button: {
      image: color00FFFFPNG,
    },
  },
  "#ef8f8f": {
    button: {
      image: colorEF8F8FPNG,
    },
  },
  "#8fef8f": {
    button: {
      image: color8FEF8FPNG,
    },
  },
  "#8f8fef": {
    button: {
      image: color8F8FEFPNG,
    },
  },
  "#efef8f": {
    button: {
      image: colorEFEF8FPNG,
    },
  },
  "#ef8fef": {
    button: {
      image: colorEF8FEFPNG,
    },
  },
  "#8fefef": {
    button: {
      image: color8FEFEFPNG,
    },
  },
  "#ffffff": {
    button: {
      image: colorFFFFFFPNG,
    },
  },
};

type ColorType = keyof typeof colors;

export { colors };
export type { ColorType };
