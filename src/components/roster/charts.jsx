// Inline SVG charts ported from the Roster prototype. Each one fills its
// container and accepts simple numeric arrays — no chart library dependency.

export function GradSpark({ vals, color, gradId, w = 200, h = 44 }) {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const sx = (i) => (i / (vals.length - 1)) * w;
  const sy = (v) => h - ((v - min) / (max - min || 1)) * (h - 6) - 3;
  const pts = vals.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`);
  const path = 'M' + pts.join(' L');
  const area = `M0,${h} L${pts.join(' L')} L${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MiniBars({ vals, color, w = 200, h = 44 }) {
  const max = Math.max(...vals);
  const bw = (w / vals.length) * 0.6;
  const gap = (w / vals.length) * 0.4;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {vals.map((v, i) => {
        const bh = (v / max) * (h - 4);
        return (
          <rect
            key={i}
            x={i * (bw + gap) + gap / 2}
            y={h - bh - 2}
            width={bw}
            height={bh}
            rx="1.5"
            fill={color}
          />
        );
      })}
    </svg>
  );
}

/**
 * Grouped bar chart with two series (e.g. "Profiles shared" + "Interviews").
 * Hardcodes the orange/blue gradient palette to match the Roster mock.
 */
export function BarChart({ data, w = 700, h = 240, seriesA = 'sales', seriesB = 'views' }) {
  const max = 70;
  const groupW = w / data.length;
  const barW = groupW * 0.28;
  const padTop = 20;
  const padBot = 30;
  const innerH = h - padTop - padBot;

  return (
    <svg className="bar-chart-svg" viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: h }}>
      <defs>
        <linearGradient id="grad-orange-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc107" />
          <stop offset="100%" stopColor="#ff7a00" />
        </linearGradient>
        <linearGradient id="grad-blue-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#2196f3" />
        </linearGradient>
      </defs>

      {/* Y gridlines */}
      {[0, 20, 40, 60].map((y) => (
        <g key={y}>
          <line
            x1="40"
            x2={w}
            y1={padTop + innerH - (y / max) * innerH}
            y2={padTop + innerH - (y / max) * innerH}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />
          <text
            x="30"
            y={padTop + innerH - (y / max) * innerH + 4}
            textAnchor="end"
            fontSize="11"
            fill="var(--text-3)"
            fontFamily="var(--font-mono)"
          >
            {y}
          </text>
        </g>
      ))}

      {data.map((d, i) => {
        const cx = 50 + i * groupW;
        const aH = (d[seriesA] / max) * innerH;
        const bH = (d[seriesB] / max) * innerH;
        return (
          <g key={i}>
            <rect className="bar-sales" x={cx - barW - 2} y={padTop + innerH - aH} width={barW} height={aH} rx="3" />
            <rect className="bar-views" x={cx + 2}        y={padTop + innerH - bH} width={barW} height={bH} rx="3" />
            <text x={cx} y={h - 10} textAnchor="middle" fontSize="11" fill="var(--text-3)">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}
