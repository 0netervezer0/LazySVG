import { generatePath } from "../utils/pathGenerator";

export default function Canvas({
  points,
  segments,
  onAddPoint,
  onMouseMove,
  onMouseUp,
  draggingPoint,
  children,
}) {
  const handleClick = (e) => {
    // Проверить, является ли целью SVG элемент или его потомок
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Добавить точку при клике на SVG или фоновый rect
    if (
      e.target === svg ||
      e.target.tagName === "svg" ||
      e.target.tagName === "rect" ||
      e.target.tagName === "defs" ||
      e.target.tagName === "pattern" ||
      e.target.id === "grid"
    ) {
      const point = {
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      };
      onAddPoint(point);
    }
  };

  const d = generatePath(points, segments);

  return (
    <svg
      width="600"
      height="400"
      onClick={handleClick}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      className="canvas-svg"
    >
      {/* Сетка фона */}
      <defs>
        <pattern
          id="grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="600" height="400" fill="url(#grid)" />

      {/* Основной путь */}
      <path d={d} fill="none" stroke="black" strokeWidth="2" />

      {/* Отрисовка контрольных точек для Безье */}
      {points.map((point, i) => {
        const segment = segments[i];
        return segment?.type === "bezier" ? (
          <g key={`bezier-${i}`}>
            {/* Линии к контрольным точкам */}
            {segment.cp1 && (
              <line
                x1={point.x}
                y1={point.y}
                x2={segment.cp1.x}
                y2={segment.cp1.y}
                stroke="#aaa"
                strokeWidth="1"
                strokeDasharray="4"
              />
            )}
            {segment.cp2 && (
              <line
                x1={point.x}
                y1={point.y}
                x2={segment.cp2.x}
                y2={segment.cp2.y}
                stroke="#aaa"
                strokeWidth="1"
                strokeDasharray="4"
              />
            )}
            {/* Контрольные точки */}
            {segment.cp1 && (
              <circle
                cx={segment.cp1.x}
                cy={segment.cp1.y}
                r="3"
                fill="#00aa00"
              />
            )}
            {segment.cp2 && (
              <circle
                cx={segment.cp2.x}
                cy={segment.cp2.y}
                r="3"
                fill="#0000aa"
              />
            )}
          </g>
        ) : null;
      })}

      {/* Основные точки */}
      {children}
    </svg>
  );
}