export const tonePeriod = 4;

export const toneTypes = [
  "verticalBold",
  "verticalMedium",
  "verticalLight",
  "horizontalBold",
  "horizontalMedium",
  "horizontalLight",
  "slashBold",
  "slashLight",
  "backslashBold",
  "backslashLight",
  "fill",
  "dotBold",
  "dotMedium",
  "dotLight",
] as const;
export type ToneType = typeof toneTypes[number];

const toneGroup1 = {
  fill: {
    bitmap: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
  },
  dotBold: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 1, 0, 1],
      [1, 1, 1, 1],
      [0, 1, 0, 1],
    ],
  },
  dotMedium: {
    bitmap: [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
    ],
  },
  dotLight: {
    bitmap: [
      [1, 0, 1, 0],
      [0, 0, 0, 0],
      [1, 0, 1, 0],
      [0, 0, 0, 0],
    ],
  },
};
const toneGroup2 = {
  slashBold: {
    bitmap: [
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [1, 0, 1, 1],
      [0, 1, 1, 1],
    ],
  },
  slashLight: {
    bitmap: [
      [1, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 0],
      [0, 1, 0, 0],
    ],
  },
  backslashBold: {
    bitmap: [
      [1, 1, 1, 0],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
    ],
  },
  backslashLight: {
    bitmap: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  },
};
const toneGroup3 = {
  horizontalBold: {
    bitmap: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
  },
  horizontalMedium: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
  },
  horizontalLight: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
};
const toneGroup4 = {
  verticalBold: {
    bitmap: [
      [1, 1, 1, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 0],
      [1, 1, 1, 0],
    ],
  },
  verticalMedium: {
    bitmap: [
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
    ],
  },
  verticalLight: {
    bitmap: [
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 0, 0, 0],
    ],
  },
};
export const toneGroups = [
  toneGroup1,
  toneGroup2,
  toneGroup3,
  toneGroup4,
] as const;

export const tones: Record<ToneType, typeof toneGroup1["fill"]> = {
  ...toneGroup1,
  ...toneGroup2,
  ...toneGroup3,
  ...toneGroup4,
};
