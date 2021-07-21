const brushes = {
  light: {
    bitmap: [[1]],
    button: {
      id: "brush-light-button",
      size: 18,
    },
    font: {
      size: 6,
    },
  },
  medium: {
    bitmap: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    button: {
      id: "brush-medium-button",
      size: 24,
    },
    font: {
      size: 18,
    },
  },
  bold: {
    bitmap: [
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 0, 0],
    ],
    button: {
      id: "brush-bold-button",
      size: 36,
    },
    font: {
      size: 54,
    },
  },
};

type BrushType = keyof typeof brushes;

export { brushes };
export type { BrushType };
