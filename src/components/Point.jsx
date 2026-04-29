export default function Point({ point, index, onMouseDown }) {
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r="5"
      fill="red"
      className="point"
      onMouseDown={onMouseDown}
      style={{ cursor: "grab" }}
    />
  );
}