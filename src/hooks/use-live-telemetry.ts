'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  fetchLiveSession,
  fetchSessionDrivers,
  fetchLiveLapData,
} from '@/app/actions';
import { Session, Driver, Lap } from '@/lib/types';

export interface LiveDriverData {
  driver: number;
  positionOnTrack: number; // 0.0 to 1.0
  gapToLeader: number; // seconds (estimated)
  color: string;
  name: string;
  lap: number;
  status: string;
}

const DEFAULT_LAP_TIME = 90; // seconds
const POLLING_INTERVAL = 30000; // 30 seconds for lap data
const REFRESH_RATE = 33; // ~30fps for smooth animation

export function useLiveTelemetry() {
  const [session, setSession] = useState<Session | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [laps, setLaps] = useState<Map<number, Lap>>(new Map());
  const [renderData, setRenderData] = useState<LiveDriverData[]>([]);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef<{
    laps: Map<number, Lap>;
    drivers: Driver[];
    session: Session | null;
  }>({
    laps: new Map(),
    drivers: [],
    session: null,
  });

  // 1. Initial Load: Session and Drivers
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setError(null);
        console.log('[Telemetry] Initializing live feed...');

        const s = await fetchLiveSession();
        if (!s) {
          console.warn('[Telemetry] No live session found');
          setError('No active session found');
          setIsLoading(false);
          return;
        }

        console.log('[Telemetry] Found session:', s.session_name, s.location);
        setSession(s);
        stateRef.current.session = s;

        const d = await fetchSessionDrivers(s.session_key);
        if (d.length === 0) {
          console.warn('[Telemetry] No drivers found for session');
          setError('No driver data available for this session');
          setIsLoading(false);
          return;
        }

        console.log(`[Telemetry] Loaded ${d.length} drivers`);
        setDrivers(d);
        stateRef.current.drivers = d;

        // Initial lap data
        const l = await fetchLiveLapData(s.session_key);
        const lapMap = new Map(l.map((lap) => [lap.driver_number, lap]));
        setLaps(lapMap);
        stateRef.current.laps = lapMap;
        setIsLoading(false);
      } catch (err) {
        console.error('[Telemetry] Failed to initialize:', err);
        setError('Failed to connect to satellite link');
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // 1.1 Periodic Session Refresh (to catch time extensions/red flags)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const s = await fetchLiveSession();
        if (s && s.session_key === stateRef.current.session?.session_key) {
          setSession(s);
          stateRef.current.session = s;
        }
      } catch (err) {
        console.error('[Telemetry] Failed to refresh session:', err);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  // 1.2 Session Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (!session?.date_end) {
        setSessionTimeRemaining('');
        return;
      }

      const endTime = new Date(session.date_end).getTime();
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setSessionTimeRemaining('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
      ].join(':');

      setSessionTimeRemaining(formatted);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // 2. Poll for lap data updates
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(async () => {
      const l = await fetchLiveLapData(session.session_key);
      const lapMap = new Map(l.map((lap) => [lap.driver_number, lap]));
      setLaps(lapMap);
      stateRef.current.laps = lapMap;
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [session]);

  // 3. High-frequency animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const { laps, drivers, session } = stateRef.current;
      if (!session || drivers.length === 0) return;

      const now = Date.now();

      const updatedData: LiveDriverData[] = drivers.map((d) => {
        const lap = laps.get(d.driver_number);
        let progress = 0;

        if (lap) {
          const startTime = new Date(lap.date_start).getTime();
          const elapsed = (now - startTime) / 1000;

          // Use previous lap duration if available, otherwise default
          const duration = lap.lap_duration || DEFAULT_LAP_TIME;

          progress = (elapsed / duration) % 1;
        }

        return {
          driver: d.driver_number,
          positionOnTrack: progress,
          gapToLeader: 0, // Simplified for now, calculation can be added
          color: `#${d.team_colour || 'FFFFFF'}`,
          name: d.name_acronym,
          lap: lap?.lap_number || 0,
          status: lap ? 'Racing' : 'Waiting',
        };
      });

      // Simple Gap estimation based on progress
      const leader = updatedData.sort(
        (a, b) => b.lap - a.lap || b.positionOnTrack - a.positionOnTrack,
      )[0];
      if (leader) {
        updatedData.forEach((d) => {
          let lapDiff = leader.lap - d.lap;
          let posDiff = leader.positionOnTrack - d.positionOnTrack;
          if (posDiff < 0) {
            lapDiff--;
            posDiff += 1;
          }
          // Very rough time gap
          d.gapToLeader =
            lapDiff * DEFAULT_LAP_TIME + posDiff * DEFAULT_LAP_TIME;
        });
      }

      setRenderData(updatedData);
    }, REFRESH_RATE);

    return () => clearInterval(interval);
  }, []);

  return {
    session,
    drivers: renderData,
    sessionTimeRemaining,
    isLoading,
    error,
  };
}
