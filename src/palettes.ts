const commonPalette = [0, 33, 67, 100].map(
  (lightness) => `hsl(0, 0%, ${lightness}%)`
);

const getChromaticPalette = ({
  saturation,
  lightness,
}: {
  saturation: number;
  lightness: number;
}) =>
  [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
    (hue) => `hsl(${hue}, ${saturation}%, ${lightness}%)`
  );

export const palettes = {
  vivid: [
    ...commonPalette,
    ...getChromaticPalette({
      saturation: 100,
      lightness: 50,
    }),
  ],
  bright: [
    ...commonPalette,
    ...getChromaticPalette({
      saturation: 75,
      lightness: 67,
    }),
  ],
  deep: [
    ...commonPalette,
    ...getChromaticPalette({
      saturation: 75,
      lightness: 33,
    }),
  ],
  light: [
    ...commonPalette,
    ...getChromaticPalette({
      saturation: 50,
      lightness: 75,
    }),
  ],
  grayish: [
    ...commonPalette,
    ...getChromaticPalette({
      saturation: 25,
      lightness: 50,
    }),
  ],
  dark: [
    ...commonPalette,
    ...getChromaticPalette({
      saturation: 50,
      lightness: 25,
    }),
  ],
};
