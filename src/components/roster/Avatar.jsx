// Initials avatar with one of six muted color schemes.
// `color` is an integer; we mod by 6 to pick a palette.
export function Avatar({ name, color = 0, size = "" }) {
  const initials = (name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className={`avatar ${size} colored-${(color || 0) % 6}`}>
      {initials || "?"}
    </span>
  );
}
