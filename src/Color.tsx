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
      <circle
        cx={12}
        cy={12}
        r={11}
        fill={color}
        stroke={
          ColorLibrary(color).hex() === "#FFFFFF" ? "hsl(0, 0%, 75%)" : color
        }
      />
    </svg>
  );
});
