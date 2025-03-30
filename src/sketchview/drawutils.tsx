import rough from "roughjs";
import { Element } from "../interface";
import * as PerfectFreehand from "perfect-freehand";
import { useCallback } from "react";

// Helper Functions
export const createRoughElement = (
  element: Element,
  color: string,
  fill: string,
  strokeWidth: number,
  roughness: number
) => {
  const rc = rough.canvas(document.createElement("canvas"));
  const options = {
    stroke: element.stroke || color,
    fill: element.fill || fill,
    strokeWidth: element.strokeWidth || strokeWidth,
    roughness,
    fillStyle: fill === "transparent" ? undefined : "solid",
  };

  const width = element.x2 - element.x1;
  const height = element.y2 - element.y1;
  const centerX = (element.x1 + element.x2) / 2;
  const centerY = (element.y1 + element.y2) / 2;

  switch (element.tool) {
    case "rectangle":
      return rc.rectangle(element.x1, element.y1, width, height, options);
    case "diamond":
      return rc.path(
        `M ${centerX} ${element.y1} ` +
          `L ${element.x2} ${centerY} ` +
          `L ${centerX} ${element.y2} ` +
          `L ${element.x1} ${centerY} ` +
          `Z`,
        options
      );
    case "arrow": {
      const lineLength = Math.hypot(width, height);
      const headLength = Math.min(lineLength * 0.3, 30);
      const angle = Math.atan2(height, width);

      const line = rc.line(
        element.x1,
        element.y1,
        element.x2,
        element.y2,
        options
      );
      const head = rc.path(
        `M ${element.x2} ${element.y2} ` +
          `L ${element.x2 - headLength * Math.cos(angle - Math.PI / 6)} ` +
          `${element.y2 - headLength * Math.sin(angle - Math.PI / 6)} ` +
          `M ${element.x2} ${element.y2} ` +
          `L ${element.x2 - headLength * Math.cos(angle + Math.PI / 6)} ` +
          `${element.y2 - headLength * Math.sin(angle + Math.PI / 6)}`,
        options
      );

      return { line, head };
    }
    case "ellipse":
      return rc.ellipse(
        centerX,
        centerY,
        Math.abs(width),
        Math.abs(height),
        options
      );
    case "line":
      return rc.line(element.x1, element.y1, element.x2, element.y2, options);
    default:
      return null;
  }
};

export const renderFreehand = (
  element: Element,
  ctx: CanvasRenderingContext2D,
  color: string,
  strokeWidth: number,
  freehandSettings: any
) => {
  if (!element.points || element.points.length < 2) return;

  const pathData = PerfectFreehand.getStroke(element.points, {
    size: element.strokeWidth || strokeWidth,
    thinning: element.freehandOptions?.thinning || freehandSettings.thinning,
    smoothing: element.freehandOptions?.smoothing || freehandSettings.smoothing,
    streamline:
      element.freehandOptions?.streamline || freehandSettings.streamline,
    start: {
      taper: element.freehandOptions?.taperStart || freehandSettings.taperStart,
      cap: true,
    },
    end: {
      taper: element.freehandOptions?.taperEnd || freehandSettings.taperEnd,
      cap: true,
    },
  });

  const path = new Path2D();
  if (pathData.length > 0) {
    path.moveTo(pathData[0][0], pathData[0][1]);
    for (let i = 1; i < pathData.length; i++) {
      path.lineTo(pathData[i][0], pathData[i][1]);
    }
    path.closePath();
  }

  ctx.fillStyle = element.stroke || color;
  ctx.fill(path);
};

export const renderText = (
  element: Element,
  ctx: CanvasRenderingContext2D,
  color: string
) => {
  if (!element.text && !element.isEditing) return;

  ctx.font = `${(element.strokeWidth || 1) * 8}px Arial`;
  ctx.fillStyle = element.stroke || color;

  if (element.isEditing) return;

  ctx.fillText(element.text || "", element.x1, element.y1 + 16);
};

export const renderSelection = (
  element: Element,
  ctx: CanvasRenderingContext2D,
  zoom: number
) => {
  const padding = 5;
  const minX = Math.min(element.x1, element.x2) - padding;
  const maxX = Math.max(element.x1, element.x2) + padding;
  const minY = Math.min(element.y1, element.y2) - padding;
  const maxY = Math.max(element.y1, element.y2) + padding;

  ctx.strokeStyle = "#3d7eff";
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([5 / zoom, 5 / zoom]);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  ctx.setLineDash([]);
};

export const renderGroupSelection = (
  elements: Element[],
  ctx: CanvasRenderingContext2D,
  zoom: number
) => {
  if (elements.length === 0) return;

  // Calculate bounding box of all selected elements
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((element) => {
    const elemMinX = Math.min(element.x1, element.x2);
    const elemMaxX = Math.max(element.x1, element.x2);
    const elemMinY = Math.min(element.y1, element.y2);
    const elemMaxY = Math.max(element.y1, element.y2);

    minX = Math.min(minX, elemMinX);
    minY = Math.min(minY, elemMinY);
    maxX = Math.max(maxX, elemMaxX);
    maxY = Math.max(maxY, elemMaxY);
  });

  const padding = 5;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  // Draw the group selection rectangle
  ctx.strokeStyle = "#3d7eff";
  ctx.lineWidth = 1 / zoom;
  ctx.setLineDash([5 / zoom, 5 / zoom]);
  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
  ctx.setLineDash([]);

  // Draw individual selection rectangles for each element
  elements.forEach((element) => {
    renderSelection(element, ctx, zoom);
  });
};

export const renderGrid = (
  ctx: CanvasRenderingContext2D,
  showGrid: boolean,
  gridSize: number,
  gridContrast: number,
  offset: { x: number; y: number },
  zoom: number,
  dimensions: { width: number; height: number }
) => {
  if (!showGrid) return;

  ctx.save();
  ctx.translate(offset.x, offset.y);
  ctx.scale(zoom, zoom);

  const dotSize = 1 + gridContrast * 1;
  const dotColor = `rgba(224, 224, 224, ${0.1 + gridContrast * 0.4})`;
  const startX = Math.floor(-offset.x / (zoom * gridSize)) * gridSize;
  const startY = Math.floor(-offset.y / (zoom * gridSize)) * gridSize;
  const endX = startX + dimensions.width / zoom + gridSize;
  const endY = startY + dimensions.height / zoom + gridSize;

  ctx.fillStyle = dotColor;
  for (let x = startX; x < endX; x += gridSize) {
    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
};