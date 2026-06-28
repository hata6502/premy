import { FunctionComponent, memo } from "react";

const borderColor = "#bdbdbd";
const borderTargetColors = ["#fff", "#ffffff", "#f5f5f5"];

export const Color: FunctionComponent<{
  color: string;
}> = memo(({ color }) => {
  const stroke = borderTargetColors.includes(color.toLowerCase())
    ? borderColor
    : color;

  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={12} cy={12} r={11} fill={color} stroke={stroke} />
    </svg>
  );
});
