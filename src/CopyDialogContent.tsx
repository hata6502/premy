import {
  Button,
  DialogContent,
  DialogContentText,
  makeStyles,
} from "@material-ui/core";
import { FunctionComponent, memo } from "react";

const useStyles = makeStyles({
  image: {
    maxWidth: "100%",
  },
  shareButton: {
    display: "flex",
    margin: "0 auto",
  },
});

export interface CopyDialogContentProps {
  title: string;
  src: string;
}

export const CopyDialogContent: FunctionComponent<CopyDialogContentProps> =
  memo(({ title, src }) => {
    const classes = useStyles();

    const handleShareButtonClick = async () => {
      const imageResponse = await fetch(src);
      const imageBlob = await imageResponse.blob();

      await navigator.share({
        files: [
          new File([imageBlob], `${title}-premy.png`, {
            type: imageBlob.type,
          }),
        ],
        text: "#premy https://premy.hata6502.com/\n",
      });
    };

    return (
      <>
        <DialogContent>
          <img alt={title} src={src} className={classes.image} />

          <DialogContentText>
            #premy
            タグ付きでXにポストすると、このサイトに掲載されることがあります。
          </DialogContentText>

          <Button
            className={classes.shareButton}
            variant="outlined"
            color="primary"
            onClick={handleShareButtonClick}
          >
            共有する
          </Button>
        </DialogContent>
      </>
    );
  });
