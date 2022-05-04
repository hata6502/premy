import { DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { FunctionComponent, memo } from "react";

const useStyles = makeStyles({
  image: {
    border: `1px solid ${grey[500]}`,
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
