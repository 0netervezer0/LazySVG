import { useState } from "react";

export default function BezierControls({ segment, onUpdate }) {
  const [cp1X, setCp1X] = useState(segment?.cp1?.x || 0);
  const [cp1Y, setCp1Y] = useState(segment?.cp1?.y || 0);
  const [cp2X, setCp2X] = useState(segment?.cp2?.x || 0);
  const [cp2Y, setCp2Y] = useState(segment?.cp2?.y || 0);

  const handleUpdate = () => {
    onUpdate(
      { x: parseFloat(cp1X), y: parseFloat(cp1Y) },
      { x: parseFloat(cp2X), y: parseFloat(cp2Y) }
    );
  };

  if (!segment) return null;

  return (
    <div className="bezier-controls">
      <h3>Контрольные точки</h3>

      <div className="control-group">
        <label>CP1 (X, Y)</label>
        <input
          type="number"
          value={cp1X}
          onChange={(e) => setCp1X(e.target.value)}
          placeholder="X"
        />
        <input
          type="number"
          value={cp1Y}
          onChange={(e) => setCp1Y(e.target.value)}
          placeholder="Y"
        />
      </div>

      <div className="control-group">
        <label>CP2 (X, Y)</label>
        <input
          type="number"
          value={cp2X}
          onChange={(e) => setCp2X(e.target.value)}
          placeholder="X"
        />
        <input
          type="number"
          value={cp2Y}
          onChange={(e) => setCp2Y(e.target.value)}
          placeholder="Y"
        />
      </div>

      <button onClick={handleUpdate} className="update-btn">
        Обновить
      </button>
    </div>
  );
}
