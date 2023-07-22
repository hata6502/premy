import {
  CSSProperties,
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export const VisualViewportPopover: FunctionComponent<{
  anchorElement?: Element;
  className?: string;
  onClose?: () => void;
}> = ({ anchorElement, className, onClose, children }) => {
  const [style, setStyle] = useState<CSSProperties>({});
  const containerElementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerElementRef.current) {
      return;
    }
    if (!visualViewport) {
      throw new Error("visualViewport is not supported");
    }
    const containerElement = containerElementRef.current;
    const viewport = visualViewport;

    const handleVisualViewportChange = () => {
      const scale = 1 / viewport.scale;

      let left = 0;
      let top = 0;

      if (anchorElement) {
        const anchorRect = anchorElement.getBoundingClientRect();
        left = anchorRect.left;
        top = anchorRect.bottom;
      }

      left = Math.min(
        left,
        viewport.offsetLeft +
          viewport.width -
          containerElement.offsetWidth * scale
      );
      top = Math.min(
        top,
        viewport.offsetTop +
          viewport.height -
          containerElement.offsetHeight * scale
      );

      left = Math.max(left, viewport.offsetLeft);
      top = Math.max(top, viewport.offsetTop);

      setStyle({ left, top, scale: String(scale) });
    };
    handleVisualViewportChange();
    viewport.addEventListener("scroll", handleVisualViewportChange);
    viewport.addEventListener("resize", handleVisualViewportChange);

    return () => {
      viewport.removeEventListener("scroll", handleVisualViewportChange);
      viewport.removeEventListener("resize", handleVisualViewportChange);
    };
  }, [anchorElement]);

  useEffect(() => {
    const handlePointerdown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        (containerElementRef.current?.contains(event.target) ||
          anchorElement?.contains(event.target))
      ) {
        return;
      }
      onClose?.();
    };
    window.addEventListener("pointerdown", handlePointerdown);

    const handleKeydown = (event: KeyboardEvent) => {
      if (onClose && event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeydown, { capture: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerdown);
      window.removeEventListener("keydown", handleKeydown, { capture: true });
    };
  }, [anchorElement, onClose]);

  return createPortal(
    <div
      ref={containerElementRef}
      style={{
        position: "fixed",
        transformOrigin: "top left",
        ...style,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body
  );
};
