import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
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
        <DialogTitle>画像を押してダウンロード</DialogTitle>

        <DialogContent>
          <a
            download={`${title}-premy.png`}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img alt={title} src={src} className={classes.image} />
          </a>

          <DialogContentText>
            Scrapboxにお絵かきを投稿すると、このサイトに掲載されることがあります。
          </DialogContentText>

          <DialogActions>
            <Button
              component="a"
              variant="outlined"
              color="primary"
              href="https://scrapbox.io/premy/%E6%8A%95%E7%A8%BF%E3%81%99%E3%82%8B"
              target="_blank"
            >
              Scrapboxに投稿
            </Button>

            <Button
              component="a"
              variant="outlined"
              color="primary"
              href="https://twitter.com/intent/tweet?hashtags=premy"
              target="_blank"
            >
              Xに投稿
            </Button>
          </DialogActions>
        </DialogContent>
      </>
    );
  });
