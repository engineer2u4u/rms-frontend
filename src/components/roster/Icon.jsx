// Lucide-style stroke icons rendered from path data. Keep a flat ICO map so
// callers can pass `<Icon d={ICO.dash} />` without importing per-icon files.

export const ICO = {
  dash:      "M3 13h7V3H3zM14 21h7V11h-7zM14 3v6h7V3zM3 21h7v-6H3z",
  clients:   ["M3 21V8l9-5 9 5v13", "M9 21V13h6v8"],
  projects:  ["M3 7h18v12H3z", "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  resources: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 11l-3-3-3 3", "M19 8v8"],
  assign:    ["M9 11l3 3 8-8", "M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"],
  admin:     ["M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"],
  billing:   ["M3 7h18v10H3z", "M3 11h18", "M7 15h3"],
  search:    ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"],
  plus:      ["M12 5v14", "M5 12h14"],
  filter:    ["M3 5h18l-7 9v6l-4-2v-4z"],
  download:  ["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"],
  upload:    ["M12 21V9", "M7 14l5-5 5 5", "M5 3h14"],
  more:      ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  bell:      ["M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16z", "M10 21h4"],
  check:     "M5 12l5 5 10-10",
  x:         ["M18 6L6 18", "M6 6l12 12"],
  caret:     "M9 6l6 6-6 6",
  chevron:   "M6 9l6 6 6-6",
  arrow:     ["M5 12h14", "M13 5l7 7-7 7"],
  send:      ["M22 2L11 13", "M22 2l-7 20-4-9-9-4z"],
  edit:      ["M12 20h9", "M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"],
  doc:       ["M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z", "M14 3v6h6"],
  spark:     ["M10 2l1.5 5L17 8l-4.5 3 1.5 5L10 13l-4 3 1.5-5L3 8l5.5-1z"],
  alert:     ["M12 9v4", "M12 17h.01", "M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"],
  user:      ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  calendar:  ["M3 5h18v16H3z", "M3 9h18", "M8 3v4", "M16 3v4"],
  mail:      ["M3 7l9 6 9-6", "M3 5h18v14H3z"],
  pin:       ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  briefcase: ["M2 7h20v13H2z", "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  globe:     ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M2 12h20", "M12 2a15 15 0 0 1 0 20", "M12 2a15 15 0 0 0 0 20"],
  star:      ["M12 2l3 7h7l-5.5 4.5L18.5 22 12 17.5 5.5 22 7.5 13.5 2 9h7z"],
  copy:      ["M9 9h10v10H9z", "M5 5h10v3", "M5 5v10h3"],
  link:      ["M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5", "M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1.5-1.5"],
  logout:    ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  settings:  ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
};

export function Icon({ d, size = 14, fill = "none", stroke = "currentColor", sw = 1.5, style, className }) {
  return (
    <svg
      className={`ico${className ? ` ${className}` : ""}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}
