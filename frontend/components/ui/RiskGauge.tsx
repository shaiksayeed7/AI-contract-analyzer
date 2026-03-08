"use client";

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function RiskGauge({ score, size = "md" }: RiskGaugeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));

  const getColor = (s: number) => {
    if (s >= 70) return "#ef4444"; // red
    if (s >= 40) return "#f59e0b"; // amber
    return "#10b981"; // green
  };

  const getLabel = (s: number) => {
    if (s >= 70) return "High Risk";
    if (s >= 40) return "Medium Risk";
    return "Low Risk";
  };

  const dimensions = {
    sm: { size: 80, strokeWidth: 6, fontSize: "text-lg" },
    md: { size: 120, strokeWidth: 8, fontSize: "text-2xl" },
    lg: { size: 160, strokeWidth: 10, fontSize: "text-4xl" },
  };

  const { size: dim, strokeWidth, fontSize } = dimensions[size];
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - clampedScore) / 100) * circumference;
  const color = getColor(clampedScore);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${fontSize}`} style={{ color }}>
            {Math.round(clampedScore)}
          </span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {getLabel(clampedScore)}
      </span>
    </div>
  );
}
