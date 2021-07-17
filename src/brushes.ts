type BrushType = "light" | "medium" | "bold";

const brushes: Record<
  BrushType,
  {
    bitmap: number[][];
    button: {
      id: string;
      size: number;
    };
  }
> = {
  light: {
    bitmap: [[1]],
    button: {
      id: "brush-light-button",
      size: 18,
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
  },
  bold: {
    bitmap: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
    ],
    button: {
      id: "brush-bold-button",
      size: 36,
    },
  },
};

export { brushes };
export type { BrushType };
