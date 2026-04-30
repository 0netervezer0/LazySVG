import React, { useRef } from "react";
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
  viewBox,
  zoomLevel,
  strokeWidth,
  fillColor,
  strokeColor,
  fillEnabled,
  onAddPoint,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onZoom,
  onPan,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  draggingPoint,
  isCtrlPressed,
  isMouseDown,
  onUpdateSegment,
  children,
}) {
  const svgRef = useRef(null);
  const [draggingControlPoint, setDraggingControlPoint] = React.useState(null);
  const [selectedSegment, setSelectedSegment] = React.useState(null);
  const [isPanning, setIsPanning] = React.useState(false);
  const [panStart, setPanStart] = React.useState(null);
  const [localMousePos, setLocalMousePos] = React.useState(null);
  const lastUpdateRef = useRef(0);

  const toViewCoords = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const point = toViewCoords(e);
    onZoom(e.deltaY, point);
  };

  React.useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    const listener = (e) => {
      e.preventDefault();
      handleWheel(e);
    };

    node.addEventListener('wheel', listener, { passive: false });
    return () => node.removeEventListener('wheel', listener, { passive: false });
  }, [viewBox]);

  const handleMouseDown = (e) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        clientX: e.clientX,
        clientY: e.clientY,
        viewBox,
      });
    }
  };

  const handleClick = (e) => {
    const svg = e.currentTarget;

    if (
      e.target === svg ||
      e.target.tagName === "svg" ||
      e.target.tagName === "rect" ||
      e.target.tagName === "defs" ||
      e.target.tagName === "pattern" ||
      e.target.id === "grid"
    ) {
      if (e.button !== 0) {
        return;
      }

      const point = toViewCoords(e);
      onAddPoint(point);
    }
  };

  const handleControlPointMouseDown = (e, segmentIndex, controlPointType) => {
    e.stopPropagation();
    setDraggingControlPoint({ segmentIndex, type: controlPointType });
    setSelectedSegment(segmentIndex);
  };

  const handleMouseMove = (e) => {
    if (isPanning && panStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const deltaX = e.clientX - panStart.clientX;
      const deltaY = e.clientY - panStart.clientY;
      const xOffset = (deltaX / rect.width) * viewBox.width;
      const yOffset = (deltaY / rect.height) * viewBox.height;
      const nextX = panStart.viewBox.x - xOffset;
      const nextY = panStart.viewBox.y - yOffset;
      onPan(nextX, nextY);
      return;
    }

    const svgPoint = toViewCoords(e);
    onMouseMove(svgPoint);
    setLocalMousePos(svgPoint);
    
    // Обработка перетаскивания контрольных точек Безье
    if (draggingControlPoint && mode === "bezier") {
      const now = Date.now();
      if (now - lastUpdateRef.current > 16) {
        const { segmentIndex, type } = draggingControlPoint;
        const segment = segments[segmentIndex];
        
        if (segment) {
          let newCp1 = segment.cp1;
          let newCp2 = segment.cp2;
          
          if (type === 'cp1') {
            newCp1 = { x: svgPoint.x, y: svgPoint.y };
          } else if (type === 'cp2') {
            newCp2 = { x: svgPoint.x, y: svgPoint.y };
          }
          
          onUpdateSegment(segmentIndex, newCp1, newCp2);
        }
        lastUpdateRef.current = now;
      }
    }
  };

  const handleMouseUp = (e) => {
    setDraggingControlPoint(null);
    setIsPanning(false);
    setPanStart(null);
    onMouseUp(e);
  };

  const d = generatePath(points, segments);

  return (
    <div className="canvas-inner">
      <svg
        ref={svgRef}
        width="600"
        height="400"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={(e) => {
          setDraggingControlPoint(null);
          setIsPanning(false);
          setPanStart(null);
          setLocalMousePos(null);
          onMouseLeave(e);
        }}
        className="canvas-svg"
      >
      {/* Сетка фона */}
      <defs>
        <pattern
          id="grid"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${1/zoomLevel})`}
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#cccccc"
            strokeWidth="1"
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
      <path d={d} fill={fillEnabled && points.length > 2 ? fillColor : "none"} stroke={strokeColor} strokeWidth={strokeWidth} />

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
                r="4"
                fill="#00aa00"
                className="control-point"
                onMouseDown={(e) => handleControlPointMouseDown(e, i, 'cp1')}
                style={{ cursor: 'grab' }}
              />
            )}
            {segment.cp2 && (
              <circle
                cx={segment.cp2.x}
                cy={segment.cp2.y}
                r="4"
                fill="#0000aa"
                className="control-point"
                onMouseDown={(e) => handleControlPointMouseDown(e, i, 'cp2')}
                style={{ cursor: 'grab' }}
              />
            )}
          </g>
        ) : null;
      })}

      {/* Превью линии при наведении мыши в режиме Линия */}
      {mode === "line" && points.length > 0 && mousePos && (
        <g opacity="0.5">
          {(() => {
            const lastPoint = points[points.length - 1];
            let previewPoint = mousePos;
            
            if (isCtrlPressed) {
              const dx = mousePos.x - lastPoint.x;
              const dy = mousePos.y - lastPoint.y;
              const angle = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;

              if (angle <= 22.5 || angle >= 157.5) {
                previewPoint = { x: mousePos.x, y: lastPoint.y };
              } else if (angle >= 67.5 && angle <= 112.5) {
                previewPoint = { x: lastPoint.x, y: mousePos.y };
              } else {
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);
                const distance = Math.min(absDx, absDy);
                const signX = dx > 0 ? 1 : -1;
                const signY = dy > 0 ? 1 : -1;
                previewPoint = {
                  x: lastPoint.x + distance * signX,
                  y: lastPoint.y + distance * signY
                };
              }
            }
            
            return (
              <>
                <line
                  x1={lastPoint.x}
                  y1={lastPoint.y}
                  x2={previewPoint.x}
                  y2={previewPoint.y}
                  stroke={isCtrlPressed ? "#ff6b6b" : "#0099ff"}
                  strokeWidth="2"
                  strokeDasharray="6"
                  pointerEvents="none"
                />
                <circle
                  cx={previewPoint.x}
                  cy={previewPoint.y}
                  r="4"
                  fill={isCtrlPressed ? "#ff6b6b" : "#0099ff"}
                  pointerEvents="none"
                />
              </>
            );
          })()}
        </g>
      )}

      {/* Превью для Безье (кривая) */}
      {mode === "bezier" && points.length > 0 && mousePos && (
        <g opacity="0.3">
          {(() => {
            const lastPoint = points[points.length - 1];
            const dx = mousePos.x - lastPoint.x;
            const dy = mousePos.y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const controlDistance = distance / 3;
            
            const tempCp1 = {
              x: lastPoint.x + controlDistance,
              y: lastPoint.y,
            };
            const tempCp2 = {
              x: mousePos.x - controlDistance,
              y: mousePos.y,
            };
            
            const tempPath = `M ${lastPoint.x} ${lastPoint.y} C ${tempCp1.x} ${tempCp1.y} ${tempCp2.x} ${tempCp2.y} ${mousePos.x} ${mousePos.y}`;
            
            return (
              <path
                d={tempPath}
                stroke="#00cc00"
                strokeWidth="1"
                strokeDasharray="4"
                fill="none"
                pointerEvents="none"
              />
            );
          })()}
        </g>
      )}

      {/* Основные точки */}
      {children}
      </svg>
      <div className="canvas-overlay">
        <div className="zoom-status">{Math.round(zoomLevel * 100)}%</div>
        {localMousePos && (
          <div className="mouse-coords">
            {Math.round(localMousePos.x)}, {Math.round(localMousePos.y)}
          </div>
        )}
        <div className="zoom-buttons">
          <button type="button" onClick={onZoomIn} className="zoom-btn" aria-label="Zoom in">+</button>
          <button type="button" onClick={onZoomOut} className="zoom-btn" aria-label="Zoom out">−</button>
          <button type="button" onClick={onResetZoom} className="zoom-btn reset-btn" aria-label="Reset zoom">⟳</button>
        </div>
      </div>
    </div>
  );
}