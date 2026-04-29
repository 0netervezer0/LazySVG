import { useState } from "react";

export function useShapeStore() {
  const [points, setPoints] = useState([]);
  const [segments, setSegments] = useState([]);

  const addPoint = (point) => {
    setPoints((prev) => [...prev, point]);
  };

  const updatePoint = (index, newPoint) => {
    setPoints((prev) =>
      prev.map((p, i) => (i === index ? newPoint : p))
    );
  };

  return {
    points,
    segments,
    addPoint,
    updatePoint,
  };
}