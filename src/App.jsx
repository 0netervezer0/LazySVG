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
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copySuccess, setCopySuccess] = useState({ svg: false, html: false });
  const lastUpdateRef = useRef(0);

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
      if (e.altKey) {
        setIsAltPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false);
      }
      if (!e.altKey) {
        setIsAltPressed(false);
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

    // Выравнивание по осям при удержании Ctrl в режиме линии
    if (mode === "line" && isCtrlPressed && points.length > 0) {
      const lastPoint = points[points.length - 1];
      const dx = point.x - lastPoint.x;
      const dy = point.y - lastPoint.y;
      const angle = Math.abs(Math.atan2(dy, dx)) * 180 / Math.PI;

      if (angle <= 22.5 || angle >= 157.5) {
        // Выравнивание по горизонтали
        finalPoint = { x: point.x, y: lastPoint.y };
      } else if (angle >= 67.5 && angle <= 112.5) {
        // Выравнивание по вертикали
        finalPoint = { x: lastPoint.x, y: point.y };
      } else {
        // Диагональ (45 градусов)
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const distance = Math.min(absDx, absDy);
        const signX = dx > 0 ? 1 : -1;
        const signY = dy > 0 ? 1 : -1;
        finalPoint = {
          x: lastPoint.x + distance * signX,
          y: lastPoint.y + distance * signY
        };
      }
    }

    if (points.length > 0) {
      const prevPoint = points[points.length - 1];
      const newSegment = {
        type: mode,
        cp1: null,
        cp2: null,
      };
      
      // For Bezier mode, we automatically create control points
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
      
      setSegments((prev) => [...prev, newSegment]);
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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    setMousePos({ x, y });
    
    if (draggingPoint !== null) {
      const now = Date.now();
      if (now - lastUpdateRef.current > 16) { // ~60fps
        setPoints((prev) =>
          prev.map((p, i) =>
            i === draggingPoint ? { x, y } : p
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

  const pathD = generatePath(points, segments);
  const svgCode = exportSVG(pathD);
  const htmlCode = exportHTML(pathD);

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>LazySVG</h2>
        <Toolbar mode={mode} setMode={setMode} />
        
        <div className="info-section">
          <h3>Информация</h3>
          <p>Точек: {points.length}</p>
          <p>Режим: <strong>{mode === "line" ? "Линия" : "Безье"}</strong></p>
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
            isCtrlPressed={isCtrlPressed}
            isAltPressed={isAltPressed}
            isMouseDown={isMouseDown}
            onAddPoint={handleAddPoint}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
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
