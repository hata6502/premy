export const fontTypes = [
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
] as const;
export type FontType = typeof fontTypes[number];

export const fonts: Record<FontType, string> = {
  "sans-serif":
    '"Noto Color Emoji", "Open Sans", "Fira Sans", "Lucida Sans", "Lucida Sans Unicode", "Trebuchet MS", "Liberation Sans", "Nimbus Sans L", sans-serif',
  serif:
    '"Noto Color Emoji", Lucida Bright, Lucida Fax, Palatino, "Palatino Linotype", Palladio, "URW Palladio", serif',
  monospace:
    '"Noto Color Emoji", "Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
  cursive:
    '"Noto Color Emoji", "Dancing Script", "Hachi Maru Pop", "Brush Script MT", "Brush Script Std", "Lucida Calligraphy", "Lucida Handwriting", "Apple Chancery", cursive',
  fantasy:
    '"Noto Color Emoji", "Fruktur", "Potta One", Papyrus, Herculanum, Party LET, Curlz MT, Harrington, fantasy',
};
