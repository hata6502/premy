import { DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { FunctionComponent, memo } from "react";

const useStyles = makeStyles({
  image: {
    maxWidth: "100%",
  },
});

export interface CopyDialogContentProps {
  src: string;
}

export const CopyDialogContent: FunctionComponent<CopyDialogContentProps> =
  memo(({ src }) => {
    const classes = useStyles();

    return (
      <>
        <DialogTitle>Please copy this image</DialogTitle>

        <DialogContent>
          <img alt="premy" className={classes.image} src={src} />
        </DialogContent>
      </>
    );
  });
