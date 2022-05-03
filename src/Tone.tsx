import ColorLibrary from "color";
import { FunctionComponent, memo } from "react";
import { ToneType, tonePeriod, tones } from "./tones";

export const Tone: FunctionComponent<{
  color: string;
  toneType: ToneType;
}> = memo(({ color, toneType }) => {
  const tone = tones[toneType];

  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[
        { offsetX: 0, offsetY: 0 },
        { offsetX: tonePeriod, offsetY: 0 },
        { offsetX: 0, offsetY: tonePeriod },
        { offsetX: tonePeriod, offsetY: tonePeriod },
      ].flatMap(({ offsetX, offsetY }) =>
        tone.bitmap.flatMap((line, toneY) =>
          line.map((isForeground, toneX) => {
            const x = offsetX + toneX;
            const y = offsetY + toneY;
            const size = 24 / (2 * tonePeriod);

            const foregroundColor =
              ColorLibrary(color).hex() === "#FFFFFF"
                ? "hsl(0, 0%, 75%)"
                : color;

            return (
              <rect
                key={`${x}-${y}`}
                x={size * x}
                y={size * y}
                width={size}
                height={size}
                fill={isForeground ? foregroundColor : "#FFFFFF"}
              />
            );
          })
        )
      )}
    </svg>
  );
});
