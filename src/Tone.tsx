import { FunctionComponent, memo } from "react";
import { ToneType, tonePeriod, tones } from "./tones";

const displayColor = "#bdbdbd";
const displayTargetColors = ["#fff", "#ffffff", "#f5f5f5"];

export const Tone: FunctionComponent<{
  color: string;
  fuzziness: number;
  toneType: ToneType;
}> = memo(({ color, fuzziness, toneType }) => {
  const toneColor = displayTargetColors.includes(color.toLowerCase())
    ? displayColor
    : color;

  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[...Array(tonePeriod * 2).keys()].flatMap((y) =>
        [...Array(tonePeriod * 2).keys()].map((x) => {
          const size = 3;

          const modulatedX = Math.floor(x + Math.random() * fuzziness);
          const modulatedY = Math.floor(y + Math.random() * fuzziness);
          const toneBit =
            tones[toneType].bitmap[modulatedY % tonePeriod][
              modulatedX % tonePeriod
            ];

          return (
            <rect
              key={`${x}-${y}`}
              x={size * x}
              y={size * y}
              width={size}
              height={size}
              fill={toneBit ? toneColor : "#FFFFFF"}
            />
          );
        })
      )}
    </svg>
  );
});
