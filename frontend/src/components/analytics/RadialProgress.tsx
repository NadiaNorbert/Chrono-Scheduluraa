"use client";

interface RadialProgressProps {
  value:     number;   // 0–100
  size?:     number;   // px
  stroke?:   number;   // stroke width
  label?:    string;
  sublabel?: string;
  color?:    string;   // Tailwind stroke colour via inline CSS
}

/**
 * SVG radial progress ring — no library.
 */
export function RadialProgress({
  value, size = 120, stroke = 10, label, sublabel,
  color = "oklch(0.62 0.07 170)",
}: RadialProgressProps) {
  const r        = (size - stroke) / 2;
  const circ     = 2 * Math.PI * r;
  const dashoff  = circ - (Math.min(value, 100) / 100) * circ;
  const center   = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} aria-label={label}>
        {/* Track */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/60"
        />
        {/* Progress */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dashoff}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Center text */}
        <text
          x={center} y={center - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ fontSize: size * 0.18, fontWeight: 700 }}
        >
          {value}%
        </text>
        {sublabel && (
          <text
            x={center} y={center + size * 0.14}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground"
            style={{ fontSize: size * 0.1 }}
          >
            {sublabel}
          </text>
        )}
      </svg>
      {label && (
        <p className="text-xs font-medium text-muted-foreground text-center">{label}</p>
      )}
    </div>
  );
}
