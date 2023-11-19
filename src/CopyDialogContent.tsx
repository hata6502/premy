import { DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { FunctionComponent, memo } from "react";

const useStyles = makeStyles({
  image: {
    maxWidth: "100%",
  },
});

export interface CopyDialogContentProps {
  title: string;
  src: string;
}

export const CopyDialogContent: FunctionComponent<CopyDialogContentProps> =
  memo(({ title, src }) => {
    const classes = useStyles();

    return (
      <>
        <DialogTitle>画像をコピーしてください</DialogTitle>

        <DialogContent>
          <a
            download={`${title}-premy.png`}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img alt={title} src={src} className={classes.image} />
          </a>
        </DialogContent>
      </>
    );
  });
