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
      id: "color-button-000000",
      image: color000000PNG,
    },
  },
  "#ff0000": {
    button: {
      id: "color-button-ff0000",
      image: colorFF0000PNG,
    },
  },
  "#00ff00": {
    button: {
      id: "color-button-00ff00",
      image: color00FF00PNG,
    },
  },
  "#0000ff": {
    button: {
      id: "color-button-0000ff",
      image: color0000FFPNG,
    },
  },
  "#ffff00": {
    button: {
      id: "color-button-ffff00",
      image: colorFFFF00PNG,
    },
  },
  "#ff00ff": {
    button: {
      id: "color-button-ff00ff",
      image: colorFF00FFPNG,
    },
  },
  "#00ffff": {
    button: {
      id: "color-button-00ffff",
      image: color00FFFFPNG,
    },
  },
  "#ffffff": {
    button: {
      id: "color-button-ffffff",
      image: colorFFFFFFPNG,
    },
  },
};

type ColorType = keyof typeof colors;

export { colors };
export type { ColorType };
