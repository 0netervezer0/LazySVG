export function generatePath(points, segments = []) {
  if (!points.length) return "";

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const seg = segments[i - 1];

    if (seg?.type === "bezier" && seg.cp1 && seg.cp2) {
      d += ` C ${seg.cp1.x} ${seg.cp1.y} ${seg.cp2.x} ${seg.cp2.y} ${points[i].x} ${points[i].y}`;
    } else {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  if (points.length > 2) {
    d += " Z";
  }

  return d;
}