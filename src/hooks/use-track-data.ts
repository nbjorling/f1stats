'use client';

import { useState, useEffect, useRef } from 'react';

export interface DriverData {
  driver: number;
  positionOnTrack: number; // 0.0 to 1.0
  gapToLeader: number; // seconds
  color: string;
}

const DRIVERS = [
  { id: 1, color: '#3671C6' }, // Verstappen (Red Bull)
  { id: 11, color: '#3671C6' }, // Perez (Red Bull)
  { id: 4, color: '#FF8000' }, // Norris (McLaren)
  { id: 81, color: '#FF8000' }, // Piastri (McLaren)
  { id: 16, color: '#E80020' }, // Leclerc (Ferrari)
  { id: 55, color: '#E80020' }, // Sainz (Ferrari)
  { id: 44, color: '#27F4D2' }, // Hamilton (Mercedes)
  { id: 63, color: '#27F4D2' }, // Russell (Mercedes)
  { id: 14, color: '#229971' }, // Alonso (Aston Martin)
  { id: 18, color: '#229971' }, // Stroll (Aston Martin)
];

const LAP_TIME = 90; // seconds
const TICK_INTERVAL = 333; // ms (3 times per second)

export function useTrackData() {
  const [data, setData] = useState<DriverData[]>([]);
  const stateRef = useRef<DriverData[]>(
    DRIVERS.map((d, i) => ({
      driver: d.id,
      positionOnTrack: 1 - i * 0.05, // Staggered start
      gapToLeader: i * 1.5,
      color: d.color,
    })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newState = stateRef.current.map((d, i) => {
        // Move car forward based on time passed
        // Slightly random speed to simulate gaps changing
        const progress =
          (TICK_INTERVAL / 1000 / LAP_TIME) *
          (1 + (Math.random() - 0.5) * 0.01);
        let newPos = d.positionOnTrack + progress;
        if (newPos >= 1) newPos -= 1;

        return {
          ...d,
          positionOnTrack: newPos,
        };
      });

      // Calculate gaps based on the leader (first in DRIVERS for simplicity)
      // In a real scenario, this would be computed by time/distance
      const leader = newState[0];
      const updatedWithGaps = newState.map((d, i) => {
        if (i === 0) return { ...d, gapToLeader: 0 };

        // Simplified gap: distance between leader and this car * lap time
        let distance = leader.positionOnTrack - d.positionOnTrack;
        if (distance < 0) distance += 1;

        return {
          ...d,
          gapToLeader: Number((distance * LAP_TIME).toFixed(3)),
        };
      });

      stateRef.current = updatedWithGaps;
      setData([...updatedWithGaps]);
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return data;
}
