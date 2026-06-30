// Status pill driven by a `color` token (ok | warn | danger | info | accent | neutral)
// and a status list of `{id, label, color}` so the same component renders any
// status family (project status, resource availability, assignment state).

export function Badge({ color = "neutral", children, withDot = true, className = "" }) {
  return (
    <span className={`badge ${color}${className ? " " + className : ""}`}>
      {withDot && <span className="dot" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, statuses }) {
  const def = statuses.find((s) => s.id === status);
  if (!def) return null;
  return <Badge color={def.color}>{def.label}</Badge>;
}
