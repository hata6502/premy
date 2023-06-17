import { ThemeProvider, createTheme } from "@material-ui/core";
import { pink } from "@material-ui/core/colors";
import { FunctionComponent, memo } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: pink.A100,
    },
  },
});

export const PremyThemeProvider: FunctionComponent = memo(({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
));
