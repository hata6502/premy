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
  light: [
    "hsl(0, 0%, 100%)",
    ...getChromaticPalette({
      saturation: 50,
      lightness: 75,
    }),
  ],
  bright: [
    "hsl(0, 0%, 80%)",
    ...getChromaticPalette({
      saturation: 75,
      lightness: 67,
    }),
  ],
  vivid: [
    "hsl(0, 0%, 60%)",
    ...getChromaticPalette({
      saturation: 100,
      lightness: 50,
    }),
  ],
  grayish: [
    "hsl(0, 0%, 40%)",
    ...getChromaticPalette({
      saturation: 25,
      lightness: 50,
    }),
  ],
  deep: [
    "hsl(0, 0%, 20%)",
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
