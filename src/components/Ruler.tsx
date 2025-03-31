import React, { useEffect, useRef } from "react";

export const RulerCorner = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    background: 'linear-gradient(to bottom right, #fff, #fff)',
    zIndex: 6,
    borderRight: '1px solid #bbb',
    borderBottom: '1px solid #bbb',
    boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)',
  }} />
);

export const Ruler = ({ type, width, height, zoom, offset, onMouseDown }: {
  type: 'horizontal' | 'vertical';
  width: number;
  height: number;
  zoom: number;
  offset: { x: number; y: number };
  onMouseDown?: React.MouseEventHandler<HTMLCanvasElement>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rulerSize = 20; // Size of the ruler in pixels
  const tickSize = 10; // Length of tick marks
  const majorTickInterval = 100; // Pixels between major ticks at zoom 1
  const minorTickInterval = 25; // Pixels between minor ticks at zoom 1

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '10px Arial';
    ctx.fillStyle = '#222'; // Darker for better contrast
    ctx.strokeStyle = '#666'; // Softer grid color
    ctx.lineWidth = 1;

    ctx.textBaseline = 'top'; // Improves text alignment

    if (type === 'horizontal') {
      const start = Math.floor(-offset.x / zoom / majorTickInterval) * majorTickInterval;
      const end = start + (width / zoom) + majorTickInterval;

      for (let pos = start; pos < end; pos += minorTickInterval) {
        const screenX = offset.x + pos * zoom;
        const isMajor = pos % majorTickInterval === 0;

        ctx.beginPath();
        ctx.moveTo(screenX, rulerSize);
        ctx.lineTo(screenX, rulerSize - (isMajor ? tickSize : tickSize / 2));
        ctx.stroke();

        if (isMajor) {
          ctx.fillStyle = "#000"; // Bolder text for major ticks
          ctx.fillText(pos.toString(), screenX + 2, rulerSize - tickSize - 5);
        }
      }
    } else {
      const start = Math.floor(-offset.y / zoom / majorTickInterval) * majorTickInterval;
      const end = start + (height / zoom) + majorTickInterval;

      for (let pos = start; pos < end; pos += minorTickInterval) {
        const screenY = offset.y + pos * zoom;
        const isMajor = pos % majorTickInterval === 0;

        ctx.beginPath();
        ctx.moveTo(rulerSize, screenY);
        ctx.lineTo(rulerSize - (isMajor ? tickSize : tickSize / 2), screenY);
        ctx.stroke();

        if (isMajor) {
          ctx.save();
          ctx.translate(5, screenY - 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = "#000";
          ctx.fillText(pos.toString(), 0, 0);
          ctx.restore();
        }
      }
    }
  }, [type, width, height, zoom, offset]);

  return (
    <canvas
      ref={canvasRef}
      width={type === 'horizontal' ? width : rulerSize}
      height={type === 'horizontal' ? rulerSize : height}
      style={{
        position: 'absolute',
        top: type === 'horizontal' ? 0 : rulerSize,
        left: type === 'horizontal' ? rulerSize : 0,
        background: 'linear-gradient(to bottom, #fff, #fff)',
        zIndex: 5,
        boxShadow: type === 'horizontal' ? '0 2px 5px rgba(0, 0, 0, 0.1)' : '2px 0 5px rgba(0, 0, 0, 0.1)',
      }}
    />
  );
};

export const Guides = ({ guides }: { guides: { x?: number; y?: number }[] }) => {
  return (
    <>
      {guides.map((guide, i) => (
        <React.Fragment key={i}>
          {guide.x !== undefined && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: guide.x,
              width: 1,
              height: '100%',
              backgroundColor: 'rgba(0, 0, 255, 0.6)',
              zIndex: 4,
              pointerEvents: 'none',
            }} />
          )}
          {guide.y !== undefined && (
            <div style={{
              position: 'absolute',
              top: guide.y,
              left: '10px',
              width: '100%',
              height: 1,
              backgroundColor: 'rgba(0, 0, 255, 0.6)',
              zIndex: 4,
              pointerEvents: 'none',
            }} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
