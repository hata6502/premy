const getChromaticPalette = ({
  saturation,
  lightness,
}: {
  saturation: number;
  lightness: number;
}) =>
  [0, 40, 80, 120, 160, 200, 240, 280, 320].map(
    (hue) => `hsl(${hue}, ${saturation}%, ${lightness}%)`
  );

export const palettes = {
  light: [
    "hsl(0, 0%, 100%)",
    ...getChromaticPalette({
      saturation: 50,
      lightness: 75,
    }),
  ],
  bright: [
    "hsl(0, 0%, 75%)",
    ...getChromaticPalette({
      saturation: 75,
      lightness: 67,
    }),
  ],
  vivid: [
    "hsl(0, 0%, 50%)",
    ...getChromaticPalette({
      saturation: 100,
      lightness: 50,
    }),
  ],
  // パレットの見せ方を調整するため、いったんコメントアウト。
  /*grayish: [
    "hsl(0, 0%, 40%)",
    ...getChromaticPalette({
      saturation: 25,
      lightness: 50,
    }),
  ],*/
  deep: [
    "hsl(0, 0%, 25%)",
    ...getChromaticPalette({
      saturation: 75,
      lightness: 33,
    }),
  ],
  dark: [
    "hsl(0, 0%, 0%)",
    ...getChromaticPalette({
      saturation: 50,
      lightness: 25,
    }),
  ],
};
