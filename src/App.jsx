import { useState, useEffect, useRef } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import BezierControls from "./components/BezierControls";
import Point from "./components/Point";
import { generatePath } from "./utils/pathGenerator";
import { exportSVG, exportHTML } from "./utils/svgExport";

export default function App() {
  const [points, setPoints] = useState([]);
  const [segments, setSegments] = useState([]);
  const [mode, setMode] = useState("line");
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [mousePos, setMousePos] = useState(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copySuccess, setCopySuccess] = useState({ svg: false, html: false });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 600, height: 400 });
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fillColor, setFillColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillEnabled, setFillEnabled] = useState(false);
  const lastUpdateRef = useRef(0);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // Функции для работы с историей
  const saveToHistory = (newPoints, newSegments) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ points: [...newPoints], segments: [...newSegments] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setPoints(prevState.points);
      setSegments(prevState.segments);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Обработчики клавиш
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
      }
    };

    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [historyIndex, history]);

  const handleAddPoint = (point) => {
    let finalPoint = point;
    const ctrlPressed = isCtrlPressed;

    if (mode === "line" && points.length > 0) {
      const lastPoint = points[points.length - 1];
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const angle = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;

      if (ctrlPressed) {
        if (angle <= 22.5 || angle >= 157.5) {
          finalPoint = { x: point.x, y: lastPoint.y };
        } else if (angle >= 67.5 && angle <= 112.5) {
          finalPoint = { x: lastPoint.x, y: point.y };
        } else {
          const distance = Math.min(absDx, absDy);
          const signX = dx > 0 ? 1 : -1;
          const signY = dy > 0 ? 1 : -1;
          finalPoint = {
            x: lastPoint.x + distance * signX,
            y: lastPoint.y + distance * signY,
          };
        }
      }
    }

    const newPoints = [...points, finalPoint];
    const newSegments = [...segments];
    if (points.length > 0) {
      const prevPoint = points[points.length - 1];
      const newSegment = {
        type: mode,
        cp1: null,
        cp2: null,
      };

      if (mode === "bezier") {
        const dx = finalPoint.x - prevPoint.x;
        const dy = finalPoint.y - prevPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const controlDistance = distance / 3;

        newSegment.cp1 = {
          x: prevPoint.x + controlDistance,
          y: prevPoint.y,
        };
        newSegment.cp2 = {
          x: finalPoint.x - controlDistance,
          y: finalPoint.y,
        };
      }

      newSegments.push(newSegment);
    }

    setPoints(newPoints);
    setSegments(newSegments);
    saveToHistory(newPoints, newSegments);
  };

  const handleMouseDown = (e, pointIndex) => {
    setDraggingPoint(pointIndex);
    setIsMouseDown(true);
  };

  const handleMouseMove = (point) => {
    setMousePos(point);

    if (draggingPoint !== null) {
      const now = Date.now();
      if (now - lastUpdateRef.current > 16) { // ~60fps
        setPoints((prev) =>
          prev.map((p, i) =>
            i === draggingPoint ? { x: point.x, y: point.y } : p
          )
        );
        lastUpdateRef.current = now;
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
    setIsMouseDown(false);
  };
  
  const handleMouseLeave = () => {
    setDraggingPoint(null);
    setIsMouseDown(false);
    setMousePos(null);
  };

  const clampRange = (value, min, max) => {
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return Math.min(Math.max(value, low), high);
  };

  const handleZoom = (deltaY, pointer) => {
    const nextZoom = clamp(
      zoomLevel * (deltaY > 0 ? 0.9 : 1.1),
      MIN_ZOOM,
      MAX_ZOOM
    );

    if (nextZoom === zoomLevel) {
      return;
    }

    const nextWidth = 600 / nextZoom;
    const nextHeight = 400 / nextZoom;

    const localX = pointer ? pointer.x : viewBox.x + viewBox.width / 2;
    const localY = pointer ? pointer.y : viewBox.y + viewBox.height / 2;
    const relativeX = (localX - viewBox.x) / viewBox.width;
    const relativeY = (localY - viewBox.y) / viewBox.height;

    const nextX = clampRange(
      localX - relativeX * nextWidth,
      600 - nextWidth,
      0
    );
    const nextY = clampRange(
      localY - relativeY * nextHeight,
      400 - nextHeight,
      0
    );

    setZoomLevel(nextZoom);
    setViewBox({ x: nextX, y: nextY, width: nextWidth, height: nextHeight });
  };

  const handlePan = (nextX, nextY) => {
    setViewBox({
      x: clampRange(nextX, 600 - viewBox.width, 0),
      y: clampRange(nextY, 400 - viewBox.height, 0),
      width: viewBox.width,
      height: viewBox.height,
    });
  };

  const handleUpdateSegment = (segmentIndex, cp1, cp2) => {
    setSegments((prev) =>
      prev.map((seg, i) =>
        i === segmentIndex
          ? { ...seg, cp1, cp2 }
          : seg
      )
    );
  };

  const handleCopySVG = async () => {
    try {
      await navigator.clipboard.writeText(svgCode);
      setCopySuccess(prev => ({ ...prev, svg: true }));
      setTimeout(() => setCopySuccess(prev => ({ ...prev, svg: false })), 2000);
    } catch (err) {
      console.error('Failed to copy SVG:', err);
    }
  };

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopySuccess(prev => ({ ...prev, html: true }));
      setTimeout(() => setCopySuccess(prev => ({ ...prev, html: false })), 2000);
    } catch (err) {
      console.error('Failed to copy HTML:', err);
    }
  };

  const handleClearCanvas = () => {
    if (window.confirm("Вы уверены? Это удалит все точки.")) {
      const newPoints = [];
      const newSegments = [];
      setPoints(newPoints);
      setSegments(newSegments);
      saveToHistory(newPoints, newSegments);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setViewBox({ x: 0, y: 0, width: 600, height: 400 });
  };

  const pathD = generatePath(points, segments);
  const svgCode = exportSVG(pathD, strokeWidth, fillColor, strokeColor, fillEnabled, points.length);
  const htmlCode = exportHTML(pathD, strokeWidth, fillColor, strokeColor, fillEnabled, points.length);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>LazySVG</h2>
        <Toolbar mode={mode} setMode={setMode} strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth} fillColor={fillColor} setFillColor={setFillColor} strokeColor={strokeColor} setStrokeColor={setStrokeColor} fillEnabled={fillEnabled} setFillEnabled={setFillEnabled} />
        
        <div className="info-section">
          <h3>Информация</h3>
          <p>Точек: {points.length}</p>
          <p>Режим: <strong>{mode === "line" ? "Линия" : "Безье"}</strong></p>
          <p>Масштаб: <strong>{Math.round(zoomLevel * 100)}%</strong></p>
        </div>

        <button onClick={handleClearCanvas} className="clear-btn">
          Очистить
        </button>

        {selectedSegment !== null && segments[selectedSegment]?.type === "bezier" && (
          <BezierControls
            segment={segments[selectedSegment]}
            onUpdate={(cp1, cp2) =>
              handleUpdateSegment(selectedSegment, cp1, cp2)
            }
          />
        )}
      </aside>

      <main className="workspace">
        <div className="canvas-container">
          <Canvas
            points={points}
            segments={segments}
            mode={mode}
            mousePos={mousePos}
            viewBox={viewBox}
            zoomLevel={zoomLevel}
            strokeWidth={strokeWidth}
            fillColor={fillColor}
            strokeColor={strokeColor}
            fillEnabled={fillEnabled}
            isCtrlPressed={isCtrlPressed}
            isMouseDown={isMouseDown}
            onAddPoint={handleAddPoint}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onZoom={handleZoom}
            onPan={handlePan}
            onResetZoom={handleResetZoom}
            onZoomIn={() => handleZoom(-1, { x: viewBox.x + viewBox.width / 2, y: viewBox.y + viewBox.height / 2 })}
            onZoomOut={() => handleZoom(1, { x: viewBox.x + viewBox.width / 2, y: viewBox.y + viewBox.height / 2 })}
            onUpdateSegment={handleUpdateSegment}
            draggingPoint={draggingPoint}
          >
            {points.map((p, i) => (
              <Point
                key={i}
                point={p}
                index={i}
                onMouseDown={(e) => handleMouseDown(e, i)}
              />
            ))}
          </Canvas>
        </div>

        <div className="export-section">
          <h3>SVG Код</h3>
          <textarea
            value={svgCode}
            readOnly
            className="code-output"
          />

          <h3>HTML Код</h3>
          <textarea
            value={htmlCode}
            readOnly
            className="code-output"
          />

          <div className="export-buttons">
            <button
              onClick={handleCopySVG}
              className={`copy-btn ${copySuccess.svg ? 'success' : ''}`}
            >
              {copySuccess.svg ? '✅' : '📋'} Копировать SVG
            </button>
            <button
              onClick={handleCopyHTML}
              className={`copy-btn ${copySuccess.html ? 'success' : ''}`}
            >
              {copySuccess.html ? '✅' : '📋'} Копировать HTML
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
