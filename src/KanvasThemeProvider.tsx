import { ThemeProvider, createTheme, useMediaQuery } from "@material-ui/core";
import { memo, useMemo } from "react";
import type { FunctionComponent } from "react";

const KanvasThemeProvider: FunctionComponent = memo(({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#ffc107",
          },
        },
      }),
    [prefersDarkMode]
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
});

export { KanvasThemeProvider };
