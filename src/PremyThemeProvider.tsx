import { ThemeProvider, createTheme } from "@material-ui/core";
import { FunctionComponent, memo } from "react";

const theme = createTheme({
  palette: {
    primary: {
      // https://tailwindcss.com/docs/colors
      // pink-500
      main: "#f6339a",
    },
  },
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

export const PremyThemeProvider: FunctionComponent = memo(({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
));
