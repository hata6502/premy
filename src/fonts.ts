const fonts = {
  "sans-serif":
    '"Open Sans", "Fira Sans", "Lucida Sans", "Lucida Sans Unicode", "Trebuchet MS", "Liberation Sans", "Nimbus Sans L", sans-serif',
  serif:
    'Lucida Bright, Lucida Fax, Palatino, "Palatino Linotype", Palladio, "URW Palladio", serif',
  monospace:
    '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
  cursive:
    '"Brush Script MT", "Brush Script Std", "Lucida Calligraphy", "Lucida Handwriting", "Apple Chancery", cursive',
  fantasy: "Papyrus, Herculanum, Party LET, Curlz MT, Harrington, fantasy",
};

type FontType = keyof typeof fonts;

export { fonts };
export type { FontType };
