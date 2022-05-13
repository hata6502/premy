import { ThemeProvider, createTheme, useMediaQuery } from "@material-ui/core";
import { pink } from "@material-ui/core/colors";
import { memo, useMemo } from "react";
import type { FunctionComponent } from "react";

const PremyThemeProvider: FunctionComponent = memo(({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            main: pink.A100,
          },
        },
      }),
    [prefersDarkMode]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
});

export { PremyThemeProvider };
