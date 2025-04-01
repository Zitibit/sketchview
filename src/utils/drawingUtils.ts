/**
 * Draws a smooth path on canvas with configurable styling
 *
 * @param ctx - Canvas 2D context
 * @param points - Array of [x,y] coordinates
 * @param options - Drawing configuration
 */
function drawSmoothPath(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  options: {
    strokeStyle?: string | CanvasGradient;
    lineWidth?: number;
    lineCap?: CanvasLineCap;
    lineJoin?: CanvasLineJoin;
    tension?: number; // Smoothing factor (0-1)
  } = {}
) {
  if (points.length < 2) return;

  // Apply defaults
  const {
    strokeStyle = "#000",
    lineWidth = 2,
    lineCap = "round",
    lineJoin = "round",
    tension = 0.5,
  } = options;

  // Save context state
  ctx.save();

  // Configure styling
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = lineCap;
  ctx.lineJoin = lineJoin;

  // Begin path
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  // Draw smooth curve
  if (points.length === 2) {
    // Straight line if only 2 points
    ctx.lineTo(points[1][0], points[1][1]);
  } else {
    // Apply cubic bezier smoothing
    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];

      // Calculate control points
      const cp1x = p1[0] + (p2[0] - p0[0]) * tension * 0.5;
      const cp1y = p1[1] + (p2[1] - p0[1]) * tension * 0.5;

      ctx.quadraticCurveTo(cp1x, cp1y, p1[0], p1[1]);
    }

    // Connect last segment
    ctx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
  }

  // Render
  ctx.stroke();

  // Restore context
  ctx.restore();
}
