'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrackData, TrackPosition } from '@/components/f1-tracks';
import { getPositionOnPath } from '@/lib/track-position-calculator';
import { cn } from '@/lib/utils';
import { DriverData } from '@/hooks/use-track-data';
import { useMediaQuery } from '@/hooks/use-media-query';

interface TrackVisualizationProps {
  track: TrackData;
  drivers: DriverData[];
  selectedDriverId: number | null;
  onDriverClick: (driverId: number) => void;
  pitExitPosition?: number | null;
}

function dashForSegment(total: number, startT: number, endT: number) {
  const start = total * startT;
  const len = total * (endT - startT);
  // show [len] then hide rest; offset moves segment into place
  return {
    strokeDasharray: `${len} ${total}`,
    strokeDashoffset: `${-start}`,
  };
}

// Separate component for static track elements to prevent re-renders
const StaticTrackVisuals = React.memo(function StaticTrackVisuals({
  track,
  rotation,
}: {
  track: TrackData;
  rotation: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [totalLength, setTotalLength] = useState(0);

  // Calculate total length once when track changes
  useEffect(() => {
    if (pathRef.current) {
      setTotalLength(pathRef.current.getTotalLength());
    }
  }, [track.path]);

  // Pre-calculate positions for static markers
  const staticMarkers = useMemo(() => {
    if (!pathRef.current || totalLength === 0) return null;

    const entryPos =
      track.pit.entryT != null ?
        getPositionOnPath(pathRef.current, track.pit.entryT)
      : null;

    const exitPos =
      track.pit.exitT != null ?
        getPositionOnPath(pathRef.current, track.pit.exitT)
      : null;

    const startFinishPos = getPositionOnPath(pathRef.current, 0);

    return { entryPos, exitPos, startFinishPos };
  }, [track, totalLength]);

  return (
    <>
      <defs>
        {/* Glow Filter for neon look - Optimized: reduced deviation */}
        <filter id="track-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Sector Gradients */}
        <linearGradient id="s1-gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#ff0000ff" />
          <stop offset="100%" stopColor="#ff0000ff" />
        </linearGradient>

        <linearGradient id="s2-gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#00ccffff" />
          <stop offset="100%" stopColor="#00ccffff" />
        </linearGradient>

        <linearGradient id="s3-gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#fbff03ff" />
          <stop offset="100%" stopColor="#fbff03ff" />
        </linearGradient>
      </defs>

      {/* Shadow path used for length calculation (hidden) */}
      <path
        ref={pathRef}
        d={track.path}
        fill="none"
        stroke="none"
        opacity={0}
      />

      {/* Dark Track Background (Base) */}
      <path
        d={track.path}
        fill="none"
        stroke="rgba(30, 30, 30, 0.6)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Visible track with three colored gradient sections */}
      {totalLength > 0 && (
        <g filter="url(#track-glow)">
          {/* Section 1 */}
          <path
            d={track.path}
            fill="none"
            stroke="url(#s1-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...dashForSegment(totalLength, 0, track.sectors?.s1End ?? 0.33)}
          />
          {/* Section 2 */}
          <path
            d={track.path}
            fill="none"
            stroke="url(#s2-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...dashForSegment(
              totalLength,
              track.sectors?.s1End ?? 0.33,
              track.sectors?.s2End ?? 0.67,
            )}
          />
          {/* Section 3 */}
          <path
            d={track.path}
            fill="none"
            stroke="url(#s3-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...dashForSegment(totalLength, track.sectors?.s2End ?? 0.67, 1)}
          />
        </g>
      )}

      {/* Static Markers Group */}
      {staticMarkers && (
        <>
          {/* Pit Entry */}
          {staticMarkers.entryPos && (
            <g>
              <line
                x1={
                  staticMarkers.entryPos.x -
                  12 *
                    Math.sin((staticMarkers.entryPos.rotation * Math.PI) / 180)
                }
                y1={
                  staticMarkers.entryPos.y +
                  12 *
                    Math.cos((staticMarkers.entryPos.rotation * Math.PI) / 180)
                }
                x2={
                  staticMarkers.entryPos.x +
                  12 *
                    Math.sin((staticMarkers.entryPos.rotation * Math.PI) / 180)
                }
                y2={
                  staticMarkers.entryPos.y -
                  12 *
                    Math.cos((staticMarkers.entryPos.rotation * Math.PI) / 180)
                }
                stroke="#fbff03ff"
                strokeWidth="1"
              />
              <text
                x={staticMarkers.entryPos.x - 24}
                y={staticMarkers.entryPos.y + 14}
                fill="white"
                fontSize="8"
                textAnchor="middle"
                className="font-mono font-bold tracking-tighter"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                transform={`rotate(${-rotation}, ${
                  staticMarkers.entryPos.x - 24
                }, ${staticMarkers.entryPos.y + 14})`}
              >
                PIT IN
              </text>
            </g>
          )}

          {/* Pit Exit */}
          {staticMarkers.exitPos && (
            <g>
              <line
                x1={
                  staticMarkers.exitPos.x -
                  12 *
                    Math.sin((staticMarkers.exitPos.rotation * Math.PI) / 180)
                }
                y1={
                  staticMarkers.exitPos.y +
                  12 *
                    Math.cos((staticMarkers.exitPos.rotation * Math.PI) / 180)
                }
                x2={
                  staticMarkers.exitPos.x +
                  12 *
                    Math.sin((staticMarkers.exitPos.rotation * Math.PI) / 180)
                }
                y2={
                  staticMarkers.exitPos.y -
                  12 *
                    Math.cos((staticMarkers.exitPos.rotation * Math.PI) / 180)
                }
                stroke="#fbff03ff"
                strokeWidth="1"
              />
              <text
                x={staticMarkers.exitPos.x - 26}
                y={staticMarkers.exitPos.y - 6}
                fill="white"
                fontSize="8"
                textAnchor="middle"
                className="font-mono font-bold tracking-tighter"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                transform={`rotate(${-rotation}, ${
                  staticMarkers.exitPos.x - 26
                }, ${staticMarkers.exitPos.y - 6})`}
              >
                PIT OUT
              </text>
            </g>
          )}

          {/* Start/Finish Line */}
          {staticMarkers.startFinishPos && (
            <g>
              <line
                x1={
                  staticMarkers.startFinishPos.x -
                  12 *
                    Math.sin(
                      (staticMarkers.startFinishPos.rotation * Math.PI) / 180,
                    )
                }
                y1={
                  staticMarkers.startFinishPos.y +
                  12 *
                    Math.cos(
                      (staticMarkers.startFinishPos.rotation * Math.PI) / 180,
                    )
                }
                x2={
                  staticMarkers.startFinishPos.x +
                  12 *
                    Math.sin(
                      (staticMarkers.startFinishPos.rotation * Math.PI) / 180,
                    )
                }
                y2={
                  staticMarkers.startFinishPos.y -
                  12 *
                    Math.cos(
                      (staticMarkers.startFinishPos.rotation * Math.PI) / 180,
                    )
                }
                stroke="white"
                strokeWidth="3"
                strokeDasharray="5 5"
                strokeLinecap="butt"
              />
            </g>
          )}
        </>
      )}
    </>
  );
});

export default function TrackVisualization({
  track,
  drivers,
  selectedDriverId,
  onDriverClick,
  pitExitPosition,
}: TrackVisualizationProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [driverPositions, setDriverPositions] = useState<
    Map<number, TrackPosition>
  >(new Map());
  const [pitExitPos, setPitExitPos] = useState<TrackPosition | null>(null);

  // Responsive Rotation Logic
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [vx, vy, vw, vh] = track.viewBox.split(' ').map(Number);
  const isLandscapeTrack = vw > vh;
  // Rotate 90deg if on mobile and track is wide
  const rotation = isMobile && isLandscapeTrack ? 90 : 0;

  // Calculate transformed viewBox if rotated
  // New x range: [-(vy+vh), -vy], width = vh
  // New y range: [vx, vx+vw], height = vw
  const transformedViewBox =
    rotation ? `${-(vy + vh)} ${vx} ${vh} ${vw}` : track.viewBox;

  // Calculate positions when drivers update
  // Note: we need a reference to the path for calculations.
  // We use a hidden path in this main component specifically for calculations.
  useEffect(() => {
    if (!pathRef.current) return;

    const newPositions = new Map<number, TrackPosition>();
    drivers.forEach((driver) => {
      const pos = getPositionOnPath(pathRef.current!, driver.positionOnTrack);
      newPositions.set(driver.driver, pos);
    });
    setDriverPositions(newPositions);

    // Calculate pit exit position if provided
    if (pitExitPosition !== null && pitExitPosition !== undefined) {
      const pitPos = getPositionOnPath(pathRef.current!, pitExitPosition);
      setPitExitPos(pitPos);
    } else {
      setPitExitPos(null);
    }
  }, [drivers, track, pitExitPosition]); // Remove pathRef.current dependency to avoid loop

  return (
    <svg
      viewBox={transformedViewBox}
      className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 will-change-transform"
      style={{ contain: 'paint' }} // Hint browser for optimization
    >
      {/* Hidden path strictly for calculations in this component */}
      <path ref={pathRef} d={track.path} display="none" />

      {/* Main Rotation Group */}
      <g
        transform={`rotate(${rotation})`}
        className="transition-transform duration-500"
      >
        {/* Static Background Layer - Memoized */}
        <StaticTrackVisuals track={track} rotation={rotation} />

        {/* Dynamic Layer - Drivers & Animations */}
        {/* Pit Exit Prediction Marker */}
        {pitExitPos && (
          <motion.g
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: pitExitPos.x,
              y: pitExitPos.y,
            }}
            transition={{
              type: 'tween', // "tween" is cheaper than "spring"
              ease: 'linear',
              duration: 0.333,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <circle
              r="12"
              fill="rgba(41, 121, 255, 0.2)"
              className="animate-pulse"
            />
            <circle r="5" fill="#2979FF" stroke="white" strokeWidth="2" />
          </motion.g>
        )}

        {/* Drivers */}
        {drivers.map((driver) => {
          const position = driverPositions.get(driver.driver);
          if (!position) return null;

          const isSelected = selectedDriverId === driver.driver;

          return (
            <motion.g
              key={driver.driver}
              initial={false}
              animate={{
                x: position.x,
                y: position.y,
              }}
              transition={{
                type: 'tween',
                ease: 'linear',
                duration: 0.333,
              }}
              onClick={() => onDriverClick(driver.driver)}
              className="cursor-pointer"
              style={{ willChange: 'transform' }} // Optimize animation
            >
              {/* Glow effect for selected */}
              {isSelected && (
                <circle
                  cx={0}
                  cy={0}
                  r="15"
                  fill={driver.color}
                  className="opacity-40 animate-ping"
                />
              )}

              {/* Car Marker */}
              <circle
                cx={0}
                cy={0}
                r={isSelected ? 10 : 7}
                fill={driver.color}
                stroke="white"
                strokeWidth={isSelected ? 2 : 1.5}
                className="drop-shadow-md"
              />

              {/* Driver Number Label */}
              <text
                x={0}
                y={3}
                textAnchor="middle"
                fill={
                  parseInt(driver.color.replace('#', ''), 16) > 0xffffff / 7 ?
                    'black'
                  : 'white'
                }
                fontSize={isSelected ? '9' : '7'}
                className="font-bold pointer-events-none select-none font-mono"
                transform={`rotate(${-rotation})`}
              >
                {driver.driver}
              </text>

              {/* Gap Label (only if selected) */}
              {isSelected && (
                <g transform={`rotate(${-rotation})`}>
                  <rect
                    x={-20}
                    y={-28}
                    width={40}
                    height={14}
                    rx={4}
                    fill="rgba(0,0,0,0.8)"
                  />
                  <text
                    x={0}
                    y={-18}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    className="font-mono font-bold"
                  >
                    +{driver.gapToLeader}s
                  </text>
                </g>
              )}
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}
