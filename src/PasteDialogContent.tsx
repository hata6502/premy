import { DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { memo, useCallback, useEffect, useRef } from "react";
import type { ClipboardEventHandler, FunctionComponent } from "react";

const useStyles = makeStyles(({ palette, shape }) => {
  return {
    container: {
      borderColor: palette.grey[500],
      borderRadius: shape.borderRadius,
      borderStyle: "solid",
      borderWidth: 1,
      margin: 1,
      outline: "none",
      "&:focus-within": {
        borderColor: palette.primary.main,
        borderWidth: 2,
        margin: 0,
      },
    },
  };
});

interface PasteDialogContentProps {
  onPaste?: (event: { src: string }) => void;
}

const PasteDialogContent: FunctionComponent<PasteDialogContentProps> = memo(
  ({ onPaste }) => {
    const classes = useStyles();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setTimeout(() => {
        if (!containerRef.current) {
          throw new Error("containerRef is null");
        }

        containerRef.current.focus();
      });
    }, []);

    const handleContainerPaste: ClipboardEventHandler = useCallback(
      (event) => {
        if (event.clipboardData.files.length < 1) {
          return;
        }

        const file = event.clipboardData.files[0];

        if (!file.type.startsWith("image")) {
          return;
        }

        const fileReader = new FileReader();

        fileReader.onload = () => {
          const src = fileReader.result;

          if (typeof src !== "string") {
            throw new Error("Source is not a string");
          }

          onPaste?.({ src });
        };

        fileReader.readAsDataURL(file);
      },
      [onPaste]
    );

    return (
      <>
        <DialogTitle>ここに画像をペーストしてください</DialogTitle>

        <DialogContent>
          <div
            className={classes.container}
            contentEditable
            ref={containerRef}
            onPaste={handleContainerPaste}
          />
        </DialogContent>
      </>
    );
  }
);

export { PasteDialogContent };
export type { PasteDialogContentProps };
