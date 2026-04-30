export default function Toolbar({ mode, setMode, strokeWidth, setStrokeWidth, fillColor, setFillColor, strokeColor, setStrokeColor, fillEnabled, setFillEnabled }) {
  return (
    <div className="toolbar">
      <button
        onClick={() => setMode("line")}
        className={`tool-btn ${mode === "line" ? "active" : ""}`}
      >
        📐 Линия
      </button>
      <button
        onClick={() => setMode("bezier")}
        className={`tool-btn ${mode === "bezier" ? "active" : ""}`}
      >
        🎨 Безье
      </button>

      <div className="stroke-controls">
        <label>Цвет линии:</label>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          className="stroke-color-picker"
        />
      </div>

      <div className="stroke-controls">
        <label>Толщина линии: {strokeWidth}px</label>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="stroke-slider"
        />
      </div>

      <div className="fill-controls">
        <label>
          <input
            type="checkbox"
            checked={fillEnabled}
            onChange={(e) => setFillEnabled(e.target.checked)}
          />
          Заливка замкнутых участков
        </label>
        <input
          type="color"
          value={fillColor}
          onChange={(e) => setFillColor(e.target.value)}
          className="fill-color-picker"
          disabled={!fillEnabled}
        />
      </div>
    </div>
  );
}