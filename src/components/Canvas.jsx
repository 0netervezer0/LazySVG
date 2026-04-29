import { generatePath } from "../utils/pathGenerator";

// Функция для рисования стрелки
function drawArrow(fromX, fromY, toX, toY) {
  const headlen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  return {
    line: `M ${fromX} ${fromY} L ${toX} ${toY}`,
    head1: `L ${toX - headlen * Math.cos(angle - Math.PI / 6)} ${toY - headlen * Math.sin(angle - Math.PI / 6)}`,
    head2: `M ${toX} ${toY} L ${toX - headlen * Math.cos(angle + Math.PI / 6)} ${toY - headlen * Math.sin(angle + Math.PI / 6)}`,
  };
}

export default function Canvas({
  points,
  segments,
  mode,
  mousePos,
  onAddPoint,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  draggingPoint,
  children,
}) {
  const handleClick = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
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
      onMouseLeave={onMouseLeave}
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
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#ff6b6b" />
        </marker>
      </defs>
      <rect width="600" height="400" fill="url(#grid)" />

      {/* Основной путь */}
      <path d={d} fill="none" stroke="black" strokeWidth="2" />

      {/* Стрелки направления для Безье кривых */}
      {segments.map((segment, i) => {
        if (segment?.type === "bezier" && segment.cp1 && segment.cp2) {
          const startPoint = points[i];
          const endPoint = points[i + 1];
          if (!startPoint || !endPoint) return null;

          // Стрелка от начальной точки к cp1
          const arrow1 = drawArrow(
            startPoint.x,
            startPoint.y,
            segment.cp1.x,
            segment.cp1.y
          );

          // Стрелка от cp2 к конечной точке
          const arrow2 = drawArrow(
            segment.cp2.x,
            segment.cp2.y,
            endPoint.x,
            endPoint.y
          );

          return (
            <g key={`arrows-${i}`}>
              {/* Стрелка 1 */}
              <path
                d={arrow1.line}
                stroke="#ff6b6b"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arrowhead)"
                opacity="0.6"
              />
              {/* Стрелка 2 */}
              <path
                d={arrow2.line}
                stroke="#ff6b6b"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arrowhead)"
                opacity="0.6"
              />
            </g>
          );
        }
        return null;
      })}

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

      {/* Превью линии при наведении мыши в режиме Линия */}
      {mode === "line" && points.length > 0 && mousePos && (
        <g opacity="0.5">
          <line
            x1={points[points.length - 1].x}
            y1={points[points.length - 1].y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#0099ff"
            strokeWidth="2"
            strokeDasharray="6"
            pointerEvents="none"
          />
          <circle
            cx={mousePos.x}
            cy={mousePos.y}
            r="4"
            fill="#0099ff"
            pointerEvents="none"
          />
        </g>
      )}

      {/* Превью для Безье (тонкая линия) */}
      {mode === "bezier" && points.length > 0 && mousePos && (
        <g opacity="0.3">
          <line
            x1={points[points.length - 1].x}
            y1={points[points.length - 1].y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#00cc00"
            strokeWidth="1"
            strokeDasharray="4"
            pointerEvents="none"
          />
        </g>
      )}

      {/* Основные точки */}
      {children}
    </svg>
  );
}