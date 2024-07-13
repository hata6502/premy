import {
  Box,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { FunctionComponent, memo, useEffect, useState } from "react";

const useStyles = makeStyles(({ palette }) => ({
  button: {
    all: "unset",
    backgroundColor: "#000000",
    borderRadius: 4,
    cursor: "pointer",
    "&:focus": {
      outline: "2px solid",
      outlineColor: palette.primary.main,
    },
  },
  image: {
    verticalAlign: "bottom",
    width: 160,
    "&:hover": {
      opacity: "0.75",
    },
  },
}));

export interface HistoryDialogContentProps {
  history: string[];
  onSelectItem: (historyIndex: number) => void;
}

export const HistoryDialogContent: FunctionComponent<HistoryDialogContentProps> =
  memo(({ history, onSelectItem }) => {
    const [objectURLHistory, setObjectURLHistory] = useState<string[]>();

    useEffect(() => {
      const objectURLHistory: string[] = [];
      const abortController = new AbortController();

      (async () => {
        for (const dataURL of history) {
          const response = await fetch(dataURL);
          const blob = await response.blob();

          if (abortController.signal.aborted) {
            throw new DOMException(
              String(abortController.signal.reason),
              "AbortError"
            );
          }
          objectURLHistory.push(URL.createObjectURL(blob));
        }

        setObjectURLHistory(objectURLHistory);
      })();

      return () => {
        setObjectURLHistory(undefined);
        abortController.abort();
        for (const objectURL of objectURLHistory) {
          URL.revokeObjectURL(objectURL);
        }
      };
    }, [history]);

    const classes = useStyles();
    if (!objectURLHistory) {
      return null;
    }
    return (
      <>
        <DialogTitle>履歴</DialogTitle>

        <DialogContent>
          <Box mb={2}>
            <Grid container spacing={2}>
              {[...objectURLHistory.entries()]
                .reverse()
                .map(([historyIndex, objectURL]) => {
                  const handleButtonClick = () => {
                    onSelectItem(historyIndex);
                  };

                  return (
                    <Grid key={historyIndex} item>
                      <button
                        type="button"
                        className={classes.button}
                        onClick={handleButtonClick}
                      >
                        <img className={classes.image} alt="" src={objectURL} />
                      </button>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        </DialogContent>
      </>
    );
  });
