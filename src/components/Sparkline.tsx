import React from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  isPositive?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color,
  width = 110,
  height = 28,
  isPositive = true,
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const usableHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Area under path
  const areaD = `M ${points[0]} L ${points.join(" L ")} L ${width - 2},${height} L 2,${height} Z`;

  const strokeColor = color || (isPositive ? "#34d399" : "#f87171");
  const fillColor = color ? `${color}20` : (isPositive ? "#34d39915" : "#f8717115");

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible select-none inline-block align-middle"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`spark-grad-${pathD.length}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-grad-${pathD.length})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      {points.length > 0 && (
        <circle
          cx={parseFloat(points[points.length - 1].split(",")[0])}
          cy={parseFloat(points[points.length - 1].split(",")[1])}
          r="2.5"
          fill={strokeColor}
        />
      )}
    </svg>
  );
};
