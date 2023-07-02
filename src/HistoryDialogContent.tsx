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
    border: "2px solid #ffffff",
    borderRadius: 4,
    cursor: "pointer",
    "&:focus": {
      borderColor: palette.primary.main,
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
  onSelectItem: (dataURL: string) => void;
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
              {[...history.entries()].reverse().map(([index, dataURL]) => {
                const handleButtonClick = () => {
                  onSelectItem(dataURL);
                };

                return (
                  <Grid key={index} item>
                    <button
                      type="button"
                      className={classes.button}
                      onClick={handleButtonClick}
                    >
                      <img className={classes.image} alt="" src={dataURL} />
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
