import ColorLibrary from "color";
import { FunctionComponent, memo } from "react";

export const Color: FunctionComponent<{
  color: string;
}> = memo(({ color }) => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={0}
        y={0}
        width={24}
        height={24}
        fill={color}
        stroke={ColorLibrary(color).hex() === "#FFFFFF" ? "hsl(0, 0%, 75%)" : color}
      />
    </svg>
  );
});
