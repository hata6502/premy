import {
  Box,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { FunctionComponent, memo } from "react";

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
    const classes = useStyles();

    return (
      <>
        <DialogTitle>History</DialogTitle>

        <DialogContent>
          <Box mb={2}>
            <Grid container spacing={2}>
              {[...history.entries()]
                .reverse()
                .map(([historyIndex, dataURL]) => {
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
                        <img
                          className={classes.image}
                          alt=""
                          src={dataURL}
                          loading="lazy"
                        />
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
