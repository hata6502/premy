const getBitmap = ({ diameter }: { diameter: number }) => {
  const radius = diameter / 2;

  return [...Array(diameter).keys()].map((y) =>
    [...Array(diameter).keys()].map((x) =>
      (x + 0.5 - radius) ** 2 + (y + 0.5 - radius) ** 2 < radius ** 2 ? 1 : 0
    )
  );
};

const brushes = {
  small: {
    bitmap: getBitmap({ diameter: 1 }),
    button: {
      size: 12,
    },
    font: {
      size: 8,
    },
  },
  medium: {
    bitmap: getBitmap({ diameter: 3 }),
    button: {
      size: 16,
    },
    font: {
      size: 20,
    },
  },
  large: {
    bitmap: getBitmap({ diameter: 7 }),
    button: {
      size: 20,
    },
    font: {
      size: 50,
    },
  },
  xLarge: {
    bitmap: getBitmap({ diameter: 15 }),
    button: {
      size: 24,
    },
    font: {
      size: 125,
    },
  },
};

type BrushType = keyof typeof brushes;

export { brushes };
export type { BrushType };
