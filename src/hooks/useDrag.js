export function useDrag(onMove) {
  const handleMouseDown = (e) => {
    const move = (event) => {
      onMove({
        x: event.clientX,
        y: event.clientY,
      });
    };

    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return { onMouseDown: handleMouseDown };
}