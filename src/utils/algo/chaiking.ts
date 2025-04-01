/**
 * Chaikin's Smoothing Algorithm
 * 
 * Input: 
 *   - points: Array of [x, y] coordinates representing a polyline/polygon
 *   - iterations: Number of smoothing passes to apply (default: 2)
 * 
 * Output:
 *   - New array of smoothed [x, y] coordinates with 2^n segments between original points
 *     (where n = iterations)
 */
function smoothPoints(
    points: [number, number][],
    iterations: number = 2
): [number, number][] {

    // Early return if not enough points to smooth
    if (points.length < 3) return points;

    // Working copy of points
    let smoothed = [...points];

    // Each iteration doubles the number of segments
    for (let i = 0; i < iterations; i++) {
        const temp: [number, number][] = [];

        // Always keep the first point (maintains start position)
        temp.push(smoothed[0]);

        // Process each segment between points
        for (let j = 1; j < smoothed.length; j++) {
            const prev = smoothed[j - 1]; // Previous point (A)
            const curr = smoothed[j];     // Current point (B)

            // Calculate new points at 1/4 (Q) and 3/4 (R) between A and B
            temp.push([
                prev[0] * 0.75 + curr[0] * 0.25, // Qx = 25% from A to B
                prev[1] * 0.75 + curr[1] * 0.25  // Qy
            ]);
            temp.push([
                prev[0] * 0.25 + curr[0] * 0.75, // Rx = 75% from A to B
                prev[1] * 0.25 + curr[1] * 0.75  // Ry
            ]);
        }

        // Always keep the last point (maintains end position)
        temp.push(smoothed[smoothed.length - 1]);

        // Update working copy for next iteration
        smoothed = temp;
    }

    return smoothed;
}

/* Example Usage:
const jaggedLine = [
  [0, 0], 
  [10, 5], 
  [20, 3], 
  [30, 10]
];
 
const smoothedLine = smoothPoints(jaggedLine, 2);
console.log(smoothedLine);

const jaggedLine = [
      [0, 0],  // Point A
      [10, 8], // Point B (sharp peak)
      [20, 0]  // Point C
  ];
  After 1st iteration
  [
      [0, 0],      // Original A (preserved)
      [2.5, 2],    // Q1 (25% between A-B)
      [7.5, 6],    // R1 (75% between A-B)
      [12.5, 6],   // Q2 (25% between B-C)
      [17.5, 2],   // R2 (75% between B-C)
      [20, 0]      // Original C (preserved)
  ]
  After 2nd iteration
  [
      [0, 0],      // Original A
      [1.25, 1],   // Q1-Q1 (25% of A-Q1)
      [3.75, 3],   // R1-Q1 (75% of A-Q1)
      [5, 4.5],    // Q1-R1 (25% of Q1-B)
      [8.75, 7.5], // R1-R1 (75% of Q1-B)
      [10.625, 7], // Q2-Q2 (25% of B-Q2)
      [14.375, 5], // R2-Q2 (75% of B-Q2)
      [15, 4],     // Q2-R2 (25% of Q2-C)
      [18.125, 1], // R2-R2 (75% of Q2-C)
      [20, 0]      // Original C
  ]
  
  Original:      A ————B———— C
  After 1 iter:  A -·-·-B-·-·- C
  After 2 iter:  A -··-··-··-··- C
*/

