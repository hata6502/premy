const getBitmap = ({ diameter }: { diameter: number }) => {
  const radius = diameter / 2;

  return [...Array(diameter).keys()].map((y) =>
    [...Array(diameter).keys()].map((x) =>
      (x + 0.5 - radius) ** 2 + (y + 0.5 - radius) ** 2 < radius ** 2 ? 1 : 0
    )
  );
};

const smallDiameter = 1;
const mediumDiameter = 3;
const largeDiameter = 7;
const xLargeDiameter = 15;

const brushes = {
  small: {
    bitmap: getBitmap({ diameter: smallDiameter }),
    button: {
      size: 12,
    },
    font: {
      size: 6 * smallDiameter,
    },
  },
  medium: {
    bitmap: getBitmap({ diameter: mediumDiameter }),
    button: {
      size: 16,
    },
    font: {
      size: 6 * mediumDiameter,
    },
  },
  large: {
    bitmap: getBitmap({ diameter: largeDiameter }),
    button: {
      size: 20,
    },
    font: {
      size: 6 * largeDiameter,
    },
  },
  xLarge: {
    bitmap: getBitmap({ diameter: xLargeDiameter }),
    button: {
      size: 24,
    },
    font: {
      size: 6 * xLargeDiameter,
    },
  },
};

type BrushType = keyof typeof brushes;

export { brushes };
export type { BrushType };
