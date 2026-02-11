'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  fetchLiveSession,
  fetchSessionDrivers,
  fetchLiveLapData,
  fetchLiveTyreData,
  fetchLivePitData,
} from '@/app/actions';
import { Session, Driver, Lap, TyreStint } from '@/lib/types';

export interface LiveDriverData {
  driver: number;
  positionOnTrack: number; // 0.0 to 1.0
  gapToLeader: number; // seconds
  color: string;
  name: string;
  lap: number;
  status: string;
  bestLap: number | null;
  lastLapTime: number | null;
  tyreCompound: string | null;
  tyreAge: number | null;
}

const DEFAULT_LAP_TIME = 90; // seconds
const POLLING_INTERVAL = 30000; // 30 seconds for lap data
const REFRESH_RATE = 33; // ~30fps for smooth animation

export function useLiveTelemetry() {
  const [session, setSession] = useState<Session | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [allLaps, setAllLaps] = useState<Lap[]>([]);
  const [stints, setStints] = useState<TyreStint[]>([]);
  const [pits, setPits] = useState<any[]>([]);
  const [renderData, setRenderData] = useState<LiveDriverData[]>([]);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stateRef = useRef<{
    allLaps: Lap[];
    stints: TyreStint[];
    pits: any[];
    drivers: Driver[];
    session: Session | null;
  }>({
    allLaps: [],
    stints: [],
    pits: [],
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

        // Initial data sync
        const [l, s_stints, p_data] = await Promise.all([
          fetchLiveLapData(s.session_key),
          fetchLiveTyreData(s.session_key),
          fetchLivePitData(s.session_key),
        ]);

        setAllLaps(l);
        setStints(s_stints);
        setPits(p_data);
        stateRef.current.allLaps = l;
        stateRef.current.stints = s_stints;
        stateRef.current.pits = p_data;
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
      try {
        const [l, s_stints, p_data] = await Promise.all([
          fetchLiveLapData(session.session_key),
          fetchLiveTyreData(session.session_key),
          fetchLivePitData(session.session_key),
        ]);

        setAllLaps(l);
        setStints(s_stints);
        setPits(p_data);
        stateRef.current.allLaps = l;
        stateRef.current.stints = s_stints;
        stateRef.current.pits = p_data;
      } catch (err) {
        console.error('[Telemetry] Polling error:', err);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { allLaps, drivers, session, stints, pits } = stateRef.current;
      if (!session || drivers.length === 0) return;

      const now = Date.now();

      // Find best overall lap for gap calculation
      const sessionBestLap =
        allLaps.length > 0 ?
          Math.min(
            ...allLaps
              .map((l) => l.lap_duration)
              .filter((d): d is number => d !== null && d > 0),
          )
        : null;

      const updatedData: LiveDriverData[] = drivers.map((d) => {
        const driverLaps = allLaps.filter(
          (l) => l.driver_number === d.driver_number,
        );
        const latestLap =
          driverLaps.length > 0 ?
            driverLaps.reduce((prev, current) =>
              current.lap_number > prev.lap_number ? current : prev,
            )
          : null;

        const bestLap =
          driverLaps.length > 0 ?
            Math.min(
              ...driverLaps
                .map((l) => l.lap_duration)
                .filter((d): d is number => d !== null && d > 0),
            )
          : null;

        const lastLapWithDuration = [...driverLaps]
          .sort((a, b) => b.lap_number - a.lap_number)
          .find((l) => l.lap_duration !== null);

        const latestStint = stints
          .filter((s) => s.driver_number === d.driver_number)
          .sort((a, b) => b.stint_number - a.stint_number)[0];

        let progress = 0;
        let status = 'In Pits';

        if (latestLap) {
          const startTime = new Date(latestLap.date_start).getTime();
          const elapsed = (now - startTime) / 1000;

          // Check for recent pit activity
          const driverPits = pits.filter(
            (p) => p.driver_number === d.driver_number,
          );
          const latestPit =
            driverPits.length > 0 ?
              driverPits.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )[0]
            : null;

          const isInPitLane =
            latestPit && new Date(latestPit.date).getTime() > startTime - 5000;

          if (latestLap.lap_duration === null && !isInPitLane) {
            if (elapsed < 600) {
              status = 'Racing';
            } else {
              status = 'In Pits';
            }
          } else {
            status = 'In Pits';
          }

          const duration = latestLap.lap_duration || DEFAULT_LAP_TIME;
          progress = (elapsed / duration) % 1;
          if (status === 'In Pits') progress = 0;
        }

        return {
          driver: d.driver_number,
          positionOnTrack: progress,
          gapToLeader: bestLap && sessionBestLap ? bestLap - sessionBestLap : 0,
          color: `#${d.team_colour || 'FFFFFF'}`,
          name: d.name_acronym,
          lap: latestLap?.lap_number || 0,
          status,
          bestLap: isFinite(bestLap || Infinity) ? bestLap : null,
          lastLapTime: lastLapWithDuration?.lap_duration || null,
          tyreCompound: latestStint?.compound || null,
          tyreAge:
            latestStint && latestLap ?
              latestLap.lap_number - latestStint.lap_start + 1
            : null,
        };
      });

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
