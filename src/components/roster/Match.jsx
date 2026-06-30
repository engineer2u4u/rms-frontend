// Match-score visualizations: circular % (default), horizontal bar, or color chip.

export function MatchCircle({ score, size = 36, accentColor }) {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const tone =
    score >= 80 ? "var(--ok)" :
    score >= 60 ? "var(--accent)" :
    score >= 45 ? "var(--warn)" :
    "var(--danger)";
  return (
    <span className={"match-circle" + (size > 40 ? " lg" : "")} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={accentColor || tone}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .4s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <span className="pct" style={{ color: accentColor || tone }}>{score}</span>
    </span>
  );
}

export function MatchBar({ score, label, heat }) {
  const tone =
    score >= 80 ? "var(--ok)" :
    score >= 60 ? "var(--accent)" :
    score >= 45 ? "var(--warn)" :
    "var(--danger)";
  return (
    <div className={`match-bar${heat ? " heat" : ""}`}>
      {label && <span className="text-xs muted" style={{ width: 70 }}>{label}</span>}
      <div className="track">
        <div className="fill" style={{ width: `${score}%`, background: heat ? undefined : tone }} />
      </div>
      <span className="pct">{score}</span>
    </div>
  );
}

export function MatchChip({ score }) {
  const tone = score >= 80 ? "ok" : score >= 60 ? "accent" : score >= 45 ? "warn" : "danger";
  return (
    <span className={`badge ${tone}`}>
      <span className="dot" />
      {score}% match
    </span>
  );
}
