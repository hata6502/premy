export const tonePeriod = 4;

export const tones = {
  fill: {
    bitmap: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
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
  dotMedium: {
    bitmap: [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
    ],
  },
  dotBold: {
    bitmap: [
      [0, 1, 0, 1],
      [1, 1, 1, 1],
      [0, 1, 0, 1],
      [1, 1, 1, 1],
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
  horizontalMedium: {
    bitmap: [
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
  },
  horizontalBold: {
    bitmap: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
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
  verticalMedium: {
    bitmap: [
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
    ],
  },
  verticalBold: {
    bitmap: [
      [0, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 1, 1, 1],
      [0, 1, 1, 1],
    ],
  },
  slashLight: {
    bitmap: [
      [0, 0, 0, 1],
      [0, 0, 1, 0],
      [0, 1, 0, 0],
      [1, 0, 0, 0],
    ],
  },
  slashBold: {
    bitmap: [
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [1, 0, 1, 1],
      [0, 1, 1, 1],
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
  backslashBold: {
    bitmap: [
      [0, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 1],
      [1, 1, 1, 0],
    ],
  },
};

type ToneType = keyof typeof tones;

export type { ToneType };
