import { ZoomIn, ZoomOut } from "lucide-react";
import { Slider } from "@ark-ui/react/slider";

import useStore from "../store";

const Zoom = () => {
  const defaultZoom = 1;
  const { zoom, setZoom, setOffset } = useStore();
  const zoomIn = () => {
    const zoomFactor = 1.1;
    const newZoom = zoom * zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5);
    setZoom(clampedZoom);
  };

  const zoomOut = () => {
    const zoomFactor = 1.1;
    const newZoom = zoom / zoomFactor;
    const clampedZoom = Math.min(Math.max(newZoom, 0.1), 5);
    setZoom(clampedZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleZoomChange = (value) => {
    setZoom(value[0]);
    // onZoomChange(value[0]);
  };

  return (
    <div className="zoom-slider-container">
      <span className="zoom-label">Zoom:</span>
      <input
        type="range"
        className="zoom-slider"
        min={0}
        max={2}
        step={0.05}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
      />
      <span className="zoom-value">{(zoom * 100).toFixed(0)}%</span>
      <button className="reset-zoom-button" onClick={resetZoom} disabled={zoom === defaultZoom }>Reset Zoom</button>
    </div>
  );
};

export default Zoom;
