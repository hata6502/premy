import color000000PNG from "./color000000.png";
import colorFF0000PNG from "./colorFF0000.png";
import color00FF00PNG from "./color00FF00.png";
import color0000FFPNG from "./color0000FF.png";
import colorFFFF00PNG from "./colorFFFF00.png";
import colorFF00FFPNG from "./colorFF00FF.png";
import color00FFFFPNG from "./color00FFFF.png";
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
  "#ffffff": {
    button: {
      image: colorFFFFFFPNG,
    },
  },
};

type ColorType = keyof typeof colors;

export { colors };
export type { ColorType };
