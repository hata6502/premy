const getBitmap = ({ diameter }: { diameter: number }) => {
  const radius = diameter / 2;

  return [...Array(diameter).keys()].map((y) =>
    [...Array(diameter).keys()].map((x) =>
      (x + 0.5 - radius) ** 2 + (y + 0.5 - radius) ** 2 < radius ** 2 ? 1 : 0
    )
  );
};

export const brushTypes = ["xLarge", "large", "medium", "small"] as const;
export type BrushType = typeof brushTypes[number];

const xLarge = {
  bitmap: getBitmap({ diameter: 15 }),
  button: { size: 24 },
  font: { size: 125 },
};
const large = {
  bitmap: getBitmap({ diameter: 7 }),
  button: { size: 20 },
  font: { size: 50 },
};
const medium = {
  bitmap: getBitmap({ diameter: 3 }),
  button: { size: 16 },
  font: { size: 20 },
};
const small = {
  bitmap: getBitmap({ diameter: 1 }),
  button: { size: 12 },
  font: { size: 8 },
};
export const brushes: Record<BrushType, typeof xLarge> = {
  xLarge,
  large,
  medium,
  small,
};
