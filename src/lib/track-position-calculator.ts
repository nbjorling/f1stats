import { TrackPosition } from "@/components/f1-tracks/types";

/**
 * Calculate position along an SVG path for a given normalized position (0-1)
 * Uses SVG path API to get coordinates and tangent angle
 */
export function getPositionOnPath(
  pathElement: SVGPathElement,
  normalizedPosition: number
): TrackPosition {
  // Ensure position is wrapped to 0-1 range
  let position = normalizedPosition % 1;
  if (position < 0) position += 1;

  const pathLength = pathElement.getTotalLength();
  const pointOnPath = position * pathLength;

  // Get point at this position
  const point = pathElement.getPointAtLength(pointOnPath);

  // Get tangent by sampling a tiny bit ahead
  const epsilon = Math.min(1, pathLength * 0.001);
  const nextPoint = pathElement.getPointAtLength(
    (pointOnPath + epsilon) % pathLength
  );

  // Calculate rotation angle from tangent
  const dx = nextPoint.x - point.x;
  const dy = nextPoint.y - point.y;
  const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    x: point.x,
    y: point.y,
    rotation,
  };
}

/**
 * Get multiple positions along a path (for example, for multiple drivers)
 */
export function getMultiplePositions(
  pathElement: SVGPathElement,
  positions: number[]
): TrackPosition[] {
  return positions.map((pos) => getPositionOnPath(pathElement, pos));
}
