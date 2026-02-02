'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { TrackData, TrackPosition } from '@/components/f1-tracks';
import { getPositionOnPath } from '@/lib/track-position-calculator';
import { cn } from '@/lib/utils';
import { DriverData } from '@/hooks/use-track-data';

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

export function TrackSvg({
  track,
  colors,
  strokeWidth = 10,
}: {
  track: TrackData;
  colors: { s1: string; s2: string; s3: string };
  strokeWidth?: number;
}) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [total, setTotal] = useState<number>(0);

  useLayoutEffect(() => {
    if (!pathRef.current) return;
    setTotal(pathRef.current.getTotalLength());
  }, [track.path]);

  const s1End = track.sectors?.s1End ?? 0.33;
  const s2End = track.sectors?.s2End ?? 0.67;

  // Pit box marker position (as fraction along main track)
  const pitBoxT = track.pit.boxT;

  const pitPoint =
    total && pitBoxT != null && pathRef.current ?
      pathRef.current.getPointAtLength(total * pitBoxT)
    : null;

  return (
    <svg viewBox={track.viewBox} width="100%" height="100%">
      {/* base outline (optional) */}
      <path
        d={track.path}
        ref={pathRef}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {total > 0 && (
        <>
          {/* Sector 1 */}
          <path
            d={track.path}
            fill="none"
            stroke={colors.s1}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...dashForSegment(total, 0, s1End)}
          />
          {/* Sector 2 */}
          <path
            d={track.path}
            fill="none"
            stroke={colors.s2}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...dashForSegment(total, s1End, s2End)}
          />
          {/* Sector 3 */}
          <path
            d={track.path}
            fill="none"
            stroke={colors.s3}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            {...dashForSegment(total, s2End, 1)}
          />

          {/* Pit box marker (optional) */}
          {pitPoint && (
            <circle
              cx={pitPoint.x}
              cy={pitPoint.y}
              r={strokeWidth * 0.6}
              fill="white"
              stroke="black"
              strokeWidth={2}
            />
          )}
        </>
      )}
    </svg>
  );
}

import { useMediaQuery } from '@/hooks/use-media-query';

// ... existing imports ...

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
  const [startFinishPos, setStartFinishPos] = useState<TrackPosition | null>(
    null,
  );

  // Responsive Rotation Logic
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [vx, vy, vw, vh] = track.viewBox.split(' ').map(Number);
  const isLandscapeTrack = vw > vh;
  // Rotate 90deg if on mobile and track is wide
  const rotation = isMobile && isLandscapeTrack ? 90 : 0;

  // Calculate transformed viewBox if rotated
  // Rotate 90 deg around (0,0) -> (x,y) becomes (-y, x)
  // New x range: [-(vy+vh), -vy], width = vh
  // New y range: [vx, vx+vw], height = vw
  const transformedViewBox =
    rotation ? `${-(vy + vh)} ${vx} ${vh} ${vw}` : track.viewBox;

  // Calculate all positions when drivers or track changes
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

    // Calculate start/finish line position (always at 0)
    const sfPos = getPositionOnPath(pathRef.current!, 0);
    setStartFinishPos(sfPos);
  }, [drivers, track, pitExitPosition, pathRef.current]);

  return (
    <svg
      viewBox={transformedViewBox}
      className="w-full h-auto drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500"
    >
      <defs>
        {/* Glow Filter for that neon look */}
        <filter id="track-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Sector 1 Gradient (Red/Orange) */}
        <linearGradient id="s1-gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#ff0000ff" />
          <stop offset="100%" stopColor="#ff0000ff" />
        </linearGradient>

        {/* Sector 2 Gradient (Cyan/Blue) */}
        <linearGradient id="s2-gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#00ccffff" />
          <stop offset="100%" stopColor="#00ccffff" />
        </linearGradient>

        {/* Sector 3 Gradient (Lime/Green) */}
        <linearGradient id="s3-gradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#fbff03ff" />
          <stop offset="100%" stopColor="#fbff03ff" />
        </linearGradient>
      </defs>

      {/* Main Rotation Group */}
      <g
        transform={`rotate(${rotation})`}
        className="transition-transform duration-500"
      >
        {/* Track path - hidden but used for calculations */}
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
          stroke="rgba(30, 30, 30, 0.6)" // Dark grey base
          strokeWidth="12" // Slightly wider base
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Visible track with three colored gradient sections */}
        {driverPositions.size > 0 && (
          <g filter="url(#track-glow)">
            {/* Section 1 */}
            <path
              d={track.path}
              fill="none"
              stroke="url(#s1-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              {...dashForSegment(
                pathRef.current!.getTotalLength(),
                0,
                track.sectors?.s1End ?? 0.33,
              )}
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
                pathRef.current!.getTotalLength(),
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
              {...dashForSegment(
                pathRef.current!.getTotalLength(),
                track.sectors?.s2End ?? 0.67,
                1,
              )}
            />
          </g>
        )}

        {/* Pit Entry Marker */}
        {pathRef.current &&
          track.pit.entryT != null &&
          (() => {
            const entryPos = getPositionOnPath(
              pathRef.current!,
              track.pit.entryT,
            );
            return (
              <g>
                <line
                  x1={
                    entryPos.x -
                    12 * Math.sin((entryPos.rotation * Math.PI) / 180)
                  }
                  y1={
                    entryPos.y +
                    12 * Math.cos((entryPos.rotation * Math.PI) / 180)
                  }
                  x2={
                    entryPos.x +
                    12 * Math.sin((entryPos.rotation * Math.PI) / 180)
                  }
                  y2={
                    entryPos.y -
                    12 * Math.cos((entryPos.rotation * Math.PI) / 180)
                  }
                  stroke="#fbff03ff"
                  strokeWidth="1"
                />
                <text
                  x={entryPos.x - 24}
                  y={entryPos.y + 14}
                  fill="white"
                  fontSize="8"
                  textAnchor="middle"
                  className="font-mono font-bold tracking-tighter"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  transform={`rotate(${-rotation}, ${entryPos.x - 24}, ${entryPos.y + 14})`}
                >
                  PIT IN
                </text>
              </g>
            );
          })()}

        {/* Pit Exit Marker */}
        {pathRef.current &&
          track.pit.exitT != null &&
          (() => {
            const exitPos = getPositionOnPath(
              pathRef.current!,
              track.pit.exitT,
            );
            return (
              <g>
                <line
                  x1={
                    exitPos.x -
                    12 * Math.sin((exitPos.rotation * Math.PI) / 180)
                  }
                  y1={
                    exitPos.y +
                    12 * Math.cos((exitPos.rotation * Math.PI) / 180)
                  }
                  x2={
                    exitPos.x +
                    12 * Math.sin((exitPos.rotation * Math.PI) / 180)
                  }
                  y2={
                    exitPos.y -
                    12 * Math.cos((exitPos.rotation * Math.PI) / 180)
                  }
                  stroke="#fbff03ff"
                  strokeWidth="1"
                />
                <text
                  x={exitPos.x - 26}
                  y={exitPos.y - 6}
                  fill="white"
                  fontSize="8"
                  textAnchor="middle"
                  className="font-mono font-bold tracking-tighter"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  transform={`rotate(${-rotation}, ${exitPos.x - 26}, ${exitPos.y - 6})`}
                >
                  PIT OUT
                </text>
              </g>
            );
          })()}

        {/* Start/Finish Line */}
        {startFinishPos && (
          <g>
            {/* Checkered flag style line */}
            <line
              x1={
                startFinishPos.x -
                12 * Math.sin((startFinishPos.rotation * Math.PI) / 180)
              }
              y1={
                startFinishPos.y +
                12 * Math.cos((startFinishPos.rotation * Math.PI) / 180)
              }
              x2={
                startFinishPos.x +
                12 * Math.sin((startFinishPos.rotation * Math.PI) / 180)
              }
              y2={
                startFinishPos.y -
                12 * Math.cos((startFinishPos.rotation * Math.PI) / 180)
              }
              stroke="white"
              strokeWidth="3"
              strokeDasharray="5 5"
              strokeLinecap="butt"
            />
          </g>
        )}

        {/* Pit Exit Prediction Marker (for live data) */}
        {pitExitPos && (
          <motion.g
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: pitExitPos.x,
              y: pitExitPos.y,
            }}
            transition={{
              type: 'tween',
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
