import toneBackslashBoldPNG from "./toneBackslashBold.png";
import toneBackslashLightPNG from "./toneBackslashLight.png";
import toneDotBoldPNG from "./toneDotBold.png";
import toneDotLightPNG from "./toneDotLight.png";
import toneDotMediumPNG from "./toneDotMedium.png";
import toneFillPNG from "./toneFill.png";
import toneHorizontalBoldPNG from "./toneHorizontalBold.png";
import toneHorizontalLightPNG from "./toneHorizontalLight.png";
import toneHorizontalMediumPNG from "./toneHorizontalMedium.png";
import toneSlashBoldPNG from "./toneSlashBold.png";
import toneSlashLightPNG from "./toneSlashLight.png";
import toneVerticalBoldPNG from "./toneVerticalBold.png";
import toneVerticalLightPNG from "./toneVerticalLight.png";
import toneVerticalMediumPNG from "./toneVerticalMedium.png";

const tones = {
  dotLight: {
    bitmap: [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    button: {
      id: "tone-dot-light-button",
      image: toneDotLightPNG,
    },
  },
  dotMedium: {
    bitmap: [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ],
    button: {
      id: "tone-dot-medium-button",
      image: toneDotMediumPNG,
    },
  },
  dotBold: {
    bitmap: [
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    button: {
      id: "tone-dot-bold-button",
      image: toneDotBoldPNG,
    },
  },
  fill: {
    bitmap: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    button: {
      id: "tone-fill-button",
      image: toneFillPNG,
    },
  },
  horizontalLight: {
    bitmap: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    button: {
      id: "tone-horizontal-light-button",
      image: toneHorizontalLightPNG,
    },
  },
  horizontalMedium: {
    bitmap: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    button: {
      id: "tone-horizontal-medium-button",
      image: toneHorizontalMediumPNG,
    },
  },
  horizontalBold: {
    bitmap: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ],
    button: {
      id: "tone-horizontal-bold-button",
      image: toneHorizontalBoldPNG,
    },
  },
  verticalLight: {
    bitmap: [
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
    ],
    button: {
      id: "tone-vertical-light-button",
      image: toneVerticalLightPNG,
    },
  },
  verticalMedium: {
    bitmap: [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ],
    button: {
      id: "tone-vertical-medium-button",
      image: toneVerticalMediumPNG,
    },
  },
  verticalBold: {
    bitmap: [
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
    ],
    button: {
      id: "tone-vertical-bold-button",
      image: toneVerticalBoldPNG,
    },
  },
  slashLight: {
    bitmap: [
      [0, 0, 0, 1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1, 0, 0, 0],
    ],
    button: {
      id: "tone-slash-light-button",
      image: toneSlashLightPNG,
    },
  },
  slashBold: {
    bitmap: [
      [1, 1, 1, 0, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 1, 0],
      [1, 1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0, 1, 1, 1],
    ],
    button: {
      id: "tone-slash-bold-button",
      image: toneSlashBoldPNG,
    },
  },
  backslashLight: {
    bitmap: [
      [1, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 1],
    ],
    button: {
      id: "tone-backslash-light-button",
      image: toneBackslashLightPNG,
    },
  },
  backslashBold: {
    bitmap: [
      [0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 0],
    ],
    button: {
      id: "tone-backslash-bold-button",
      image: toneBackslashBoldPNG,
    },
  },
};

type ToneType = keyof typeof tones;

export { tones };
export type { ToneType };
