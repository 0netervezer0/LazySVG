import { useState } from "react";
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

  const handleAddPoint = (point) => {
    if (points.length > 0) {
      const prevPoint = points[points.length - 1];
      const newSegment = {
        type: mode,
        cp1: null,
        cp2: null,
      };
      
      // Для режима Безье автоматически создаём контрольные точки
      if (mode === "bezier") {
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const controlDistance = distance / 3;
        
        newSegment.cp1 = {
          x: prevPoint.x + controlDistance,
          y: prevPoint.y,
        };
        newSegment.cp2 = {
          x: point.x - controlDistance,
          y: point.y,
        };
      }
      
      setSegments((prev) => [...prev, newSegment]);
    }
    setPoints((prev) => [...prev, point]);
  };

  const handleMouseDown = (e, pointIndex) => {
    setDraggingPoint(pointIndex);
  };

  const handleMouseMove = (e) => {
    if (draggingPoint !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;

      setPoints((prev) =>
        prev.map((p, i) =>
          i === draggingPoint ? { x: newX, y: newY } : p
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingPoint(null);
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

  const handleClearCanvas = () => {
    if (window.confirm("Вы уверены? Это удалит все точки.")) {
      setPoints([]);
      setSegments([]);
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
            onAddPoint={handleAddPoint}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
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
              onClick={() => navigator.clipboard.writeText(svgCode)}
              className="copy-btn"
            >
              Копировать SVG
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(htmlCode)}
              className="copy-btn"
            >
              Копировать HTML
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
