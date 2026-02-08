import fs from 'fs/promises';
import path from 'path';
import {
  Driver,
  DriverSeasonStats,
  DriverStanding,
  Session,
  SessionResult,
} from './types';

const API_BASE = 'https://api.openf1.org/v1';

export async function getAllSessions(year: number): Promise<Session[]> {
  // Fetch all sessions for year without session_type filter
  const res = await fetch(`${API_BASE}/sessions?year=${year}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const sessionData = await res.json();

  // Sort sessions by date
  return sessionData.sort(
    (a: Session, b: Session) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}

export async function getSessionTop3(
  sessionKey: number,
): Promise<SessionResult[]> {
  // Optimization to avoid fetching too much data if possible,
  // but OpenF1 /session_result is usually fast. We'll fetch all and slice.
  // If we could filter by position via API param that would be better, but docs check needed.
  // Assuming simple fetch for now.
  try {
    const res = await fetch(
      `${API_BASE}/session_result?session_key=${sessionKey}`,
      { cache: 'force-cache', next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data: SessionResult[] = await res.json();
    // Sort by position and take top 3
    return data
      .sort((a, b) => a.position - b.position)
      .filter((r) => r.position > 0 && r.position <= 3) // ensure valid position
      .slice(0, 3);
  } catch (e) {
    console.error(`Failed to fetch top 3 for session ${sessionKey}`, e);
    return [];
  }
}

export async function getSessions(
  year: number,
  sessionType: string = 'Race',
): Promise<Session[]> {
  const res = await fetch(
    `${API_BASE}/sessions?year=${year}&session_type=${sessionType}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const sessionData = await res.json();

  // Sort sessions by date
  return sessionData.sort(
    (a: Session, b: Session) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}

export async function getDrivers(sessionKey: number): Promise<Driver[]> {
  const res = await fetch(`${API_BASE}/drivers?session_key=${sessionKey}`);
  if (!res.ok) throw new Error('Failed to fetch drivers');
  return res.json();
}

export async function getSeasonDrivers(year: number): Promise<Driver[]> {
  const cacheDir = path.join(process.cwd(), 'src', 'data', 'drivers');
  const cacheFile = path.join(cacheDir, `${year}.json`);

  // 1. Try Cache
  try {
    const cached = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(cached);
  } catch (e) {
    // cache miss
  }

  try {
    // 2. Fetch
    const sessions = await getAllSessions(year);
    if (sessions.length === 0) return [];

    // Use the last session to get the most up-to-date driver list
    const lastSession = sessions[sessions.length - 1];
    const drivers = await getDrivers(lastSession.session_key);

    // 3. Save Cache
    try {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(drivers, null, 2));
    } catch (e) {
      console.error('Failed to write driver cache', e);
    }

    return drivers;
  } catch (e) {
    console.error('Failed to fetch season drivers', e);
    return [];
  }
}

export async function getSessionResults(
  sessionKey: number,
  retries = 3,
): Promise<SessionResult[]> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(
        `${API_BASE}/session_result?session_key=${sessionKey}`,
        { cache: 'no-store' },
      );

      if (res.ok) {
        const data = await res.json();
        try {
          await fs.appendFile(
            '/tmp/debug_f1.log',
            `SUCCESS ${sessionKey}: ${Array.isArray(data) ? data.length : 'Not Array'} items\n`,
          );
        } catch (e) {}
        return data;
      }

      if (res.status === 429) {
        // Rate limit hit, wait longer
        const delay = 1000 * Math.pow(2, i);
        console.warn(
          `Rate limit hit for session ${sessionKey}. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Other error statuses
      console.warn(
        `Failed to fetch results for session ${sessionKey}: Status ${res.status}`,
      );
      try {
        await fs.appendFile(
          '/tmp/debug_f1.log',
          `FAIL ${sessionKey}: Status ${res.status}\n`,
        );
      } catch (e) {}
      return [];
    } catch (e) {
      console.error(`Error fetching session ${sessionKey}:`, e);
      try {
        await fs.appendFile('/tmp/debug_f1.log', `ERROR ${sessionKey}: ${e}\n`);
      } catch (ex) {}
      if (i === retries - 1) return []; // Give up
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry on network error
    }
  }
  return [];
}

export async function getSeasonPoints(
  year: number,
): Promise<DriverSeasonStats[]> {
  const cacheDir = path.join(process.cwd(), 'src', 'data', 'cache');
  const cacheFile = path.join(cacheDir, `season-${year}.json`);

  // 1. Try to read from cache
  try {
    const cachedData = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(cachedData);
  } catch (error) {
    // Cache miss or error reading, proceed to fetch
  }

  // 2. Get all race sessions for the year
  const sessions = await getSessions(year);
  if (sessions.length === 0) return [];
  console.log('sessions', sessions);

  // 3. Get driver info from last session (for metadata)
  const lastSession = sessions[sessions.length - 1];
  const drivers = await getDrivers(lastSession.session_key);

  // 4a. Special handling for 2025: Fetch 2024 drivers to backfill missing country codes
  const fallbackDriverMap = new Map<number, Driver>();
  if (year === 2025) {
    try {
      // Use Abu Dhabi 2024 (9662) as it likely has most drivers
      const fallbackDrivers = await getDrivers(9662);
      fallbackDrivers.forEach((d) => fallbackDriverMap.set(d.driver_number, d));
    } catch (e) {
      console.warn(
        'Failed to fetch fallback drivers for 2025 country backfill',
      );
    }
  }

  // 4. Fetch results for ALL sessions (Sequential to avoid rate limits)
  const historyData: { session: Session; results: SessionResult[] }[] = [];

  for (const session of sessions) {
    const results = await getSessionResults(session.session_key);
    historyData.push({ session, results });
    // Optional: delay to be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('historyData', JSON.stringify(historyData));
  // 5. Aggregate data
  const driverStatsMap = new Map<number, DriverSeasonStats>();

  // Initialize with known drivers
  drivers.forEach((d) => {
    // Backfill country code if missing (common in 2025 data)
    if (!d.country_code && fallbackDriverMap.has(d.driver_number)) {
      d.country_code =
        fallbackDriverMap.get(d.driver_number)?.country_code || '';
    }

    driverStatsMap.set(d.driver_number, {
      driver_number: d.driver_number,
      driver_info: d,
      history: [],
      total_points: 0,
    });
  });

  // Track cumulative points per driver
  const driverCumulativePoints = new Map<number, number>();

  for (const { session, results } of historyData) {
    // Drivers who participated in this session
    const sessionDrivers = new Set<number>();

    // Debug extraction for crucial session
    if (session.session_key === 9693) {
      try {
        const lando = results.find((r) => r.driver_number === 4);
        await fs.appendFile(
          '/tmp/debug_f1.log',
          `AGGREGATE 9693: Results ${results.length}. Lando found: ${!!lando}, Points: ${lando?.points}, DriverNumType: ${typeof lando?.driver_number}\n`,
        );
      } catch (e) {}
    }

    results.forEach((result) => {
      const dNum = result.driver_number;
      sessionDrivers.add(dNum);

      let stats = driverStatsMap.get(dNum);
      if (!stats) {
        // New driver found
        stats = {
          driver_number: dNum,
          driver_info: {
            driver_number: dNum,
            // ... minimal info if we don't have it ...
            // Actually we should have it from fallbackDriverMap or initial drivers
            // but if a NEW driver appears mid-season who wasn't in last race, we might have partial info.
            // For now let's hope existing logic handles it (it creates a stats object).
          } as Driver, // Partial cast
          history: [],
          total_points: 0,
        };
        // Check fallback map for country if available
        if (fallbackDriverMap.has(dNum)) {
          stats.driver_info = {
            ...stats.driver_info!,
            ...fallbackDriverMap.get(dNum)!,
          };
        }
        driverStatsMap.set(dNum, stats);
      }

      // Update points
      const currentTotal =
        (driverCumulativePoints.get(dNum) || 0) + result.points;
      driverCumulativePoints.set(dNum, currentTotal);

      stats.total_points = currentTotal;

      stats.history.push({
        meeting_key: result.meeting_key,
        session_key: result.session_key,
        meeting_name: session.country_name,
        date: session.date_start,
        points: result.points,
        position: result.position,
        cumulative_points: currentTotal,
      });
    });

    // Handle absent drivers (retain previous points)
    driverStatsMap.forEach((stats, dNum) => {
      if (!sessionDrivers.has(dNum)) {
        const currentTotal = driverCumulativePoints.get(dNum) || 0;

        stats.history.push({
          meeting_key: session.meeting_key,
          session_key: session.session_key,
          meeting_name: session.country_name,
          date: session.date_start,
          points: 0,
          position: 0, // N/A
          cumulative_points: currentTotal,
        });
      }
    });
  }

  const finalStats = Array.from(driverStatsMap.values()).sort(
    (a, b) => b.total_points - a.total_points,
  );

  // 6. Write to cache
  try {
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cacheFile, JSON.stringify(finalStats, null, 2));
  } catch (error) {
    console.error('Failed to write to cache:', error);
    try {
      await fs.writeFile(
        path.join(process.cwd(), 'debug_server_error.txt'),
        `Error writing cache: ${JSON.stringify(error)}`,
      );
    } catch (e) {}
  }

  return finalStats;
}
