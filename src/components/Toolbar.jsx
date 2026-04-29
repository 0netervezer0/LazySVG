export default function Toolbar({ mode, setMode }) {
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
    </div>
  );
}