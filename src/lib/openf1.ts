import fs from 'fs/promises';
import path from 'path';
import {
  Driver,
  DriverSeasonStats,
  DriverStanding,
  Session,
  SessionResult,
  TyreStint,
  TrackTyreInfo,
  TeammateBattle,
} from './types';

import { openF1Client } from './api-client';

const API_BASE = 'https://api.openf1.org/v1';

export async function getAllSessions(year: number): Promise<Session[]> {
  // 1. Try to read from raw cache first
  try {
    const cachePath = path.join(
      process.cwd(),
      'src',
      'data',
      'raw',
      'seasons',
      `${year}.json`,
    );
    const fileContent = await fs.readFile(cachePath, 'utf-8');
    const weekends = JSON.parse(fileContent);
    // Flatten weekends to sessions
    // Check if it's the new format (RaceWeekend[]) or old format (Session[])
    // Based on cache-seasons.ts it is RaceWeekend[]

    // Safety check if it's array
    if (Array.isArray(weekends)) {
      if (weekends.length > 0 && 'sessions' in weekends[0]) {
        // It's RaceWeekend[]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allSessions = weekends.flatMap((w: any) => w.sessions);
        return allSessions.sort(
          (a: Session, b: Session) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
        );
      } else {
        // It's likely Session[] (legacy or API direct dump)
        return weekends.sort(
          (a: Session, b: Session) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
        );
      }
    }
  } catch (e) {
    // Cache miss or error
    console.log(`Local season cache miss for ${year}, fetching from API...`);
  }

  // 2. Fetch all sessions for year without session_type filter
  try {
    const sessionData = await openF1Client.fetch<Session[]>(
      `/sessions?year=${year}`,
    );
    return sessionData.sort(
      (a: Session, b: Session) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );
  } catch (e) {
    console.error('Failed to fetch sessions:', e);
    throw e;
  }
}

export async function getSessionTop3(
  sessionKey: number,
): Promise<SessionResult[]> {
  try {
    const data = await openF1Client.fetch<SessionResult[]>(
      `/session_result?session_key=${sessionKey}`,
    );
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
  const sessionData = await openF1Client.fetch<Session[]>(
    `/sessions?year=${year}&session_type=${sessionType}`,
  );
  // Sort sessions by date
  return sessionData.sort(
    (a: Session, b: Session) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}

export async function getDrivers(sessionKey: number): Promise<Driver[]> {
  return openF1Client.fetch<Driver[]>(`/drivers?session_key=${sessionKey}`);
}

export async function getSeasonDrivers(year: number): Promise<Driver[]> {
  const cacheDir = path.join(process.cwd(), 'src', 'data', 'raw', 'drivers');
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
  try {
    const data = await openF1Client.fetch<SessionResult[]>(
      `/session_result?session_key=${sessionKey}`,
    );
    try {
      // debug log removed to clean up code
    } catch (e) {}
    return data;
  } catch (e) {
    console.error(`Error fetching session ${sessionKey}:`, e);
    return [];
  }
}

export async function getSeasonPoints(
  year: number,
): Promise<DriverSeasonStats[]> {
  const cacheDir = path.join(
    process.cwd(),
    'src',
    'data',
    'processed',
    'standings',
  );
  const cacheFile = path.join(cacheDir, `${year}.json`);

  // 1. Try to read from cache
  try {
    const cachedData = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(cachedData);
  } catch (error) {
    // Cache miss or error reading, proceed to fetch
  }

  // 2. Get all race sessions for the year
  const raceSessions = await getSessions(year, 'Race');
  const qualiSessions = await getSessions(year, 'Qualifying');

  if (raceSessions.length === 0) return [];
  console.log('raceSessions', raceSessions.length);
  console.log('qualiSessions', qualiSessions.length);

  // 3. Get driver info from last session (for metadata)
  const lastSession = raceSessions[raceSessions.length - 1];
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
  // Fetch Race Results
  const historyData: { session: Session; results: SessionResult[] }[] = [];
  for (const session of raceSessions) {
    const results = await getSessionResults(session.session_key);
    historyData.push({ session, results });
  }

  // Fetch Qualifying Results
  const qualiData: { session: Session; results: SessionResult[] }[] = [];
  for (const session of qualiSessions) {
    const results = await getSessionResults(session.session_key);
    qualiData.push({ session, results });
  }

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
      qualifying_history: [],
      total_points: 0,
    });
  });

  // Track cumulative points per driver
  const driverCumulativePoints = new Map<number, number>();

  // Process Race Data
  for (const { session, results } of historyData) {
    // Drivers who participated in this session
    const sessionDrivers = new Set<number>();

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
          } as Driver, // Partial cast
          history: [],
          qualifying_history: [],
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
        is_classified: result.position !== null && result.position > 0, // Basic classification check
        status: result.status,
      });
    });

    // Handle absent drivers (retain previous points)
    driverStatsMap.forEach((stats, dNum) => {
      if (!sessionDrivers.has(dNum)) {
        const currentTotal = driverCumulativePoints.get(dNum) || 0;

        // If driver didn't participate, likely didn't start (DNS) or wasn't entered.
        // We push an entry with position 0/null to indicate absence if needed for charts.
        // For DNS tracking, if they are in the season list but not in this race result,
        // it might be DNS or just not entered. OpenF1 usually returns DNS rows if they participated in quali?
        // Let's assume this effectively covers 'Did Not Start' if they are a regular driver.

        stats.history.push({
          meeting_key: session.meeting_key,
          session_key: session.session_key,
          meeting_name: session.country_name,
          date: session.date_start,
          points: 0,
          position: 0, // N/A
          cumulative_points: currentTotal,
          is_classified: false,
          status: 0, // Unknown/Absent
        });
      }
    });
  }

  // Process Qualifying Data
  for (const { session, results } of qualiData) {
    results.forEach((result) => {
      const dNum = result.driver_number;
      const stats = driverStatsMap.get(dNum);
      if (stats && result.position) {
        stats.qualifying_history.push({
          meeting_key: session.meeting_key,
          session_key: session.session_key,
          position: result.position,
          date: session.date_start,
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

export async function getTyreStints(sessionKey: number): Promise<TyreStint[]> {
  try {
    return openF1Client.fetch<TyreStint[]>(`/stints?session_key=${sessionKey}`);
  } catch (e) {
    console.error(`Failed to fetch tyre stints for session ${sessionKey}`, e);
    return [];
  }
}

export async function getSeasonTyreData(
  year: number,
): Promise<TrackTyreInfo[]> {
  const cacheDir = path.join(
    process.cwd(),
    'src',
    'data',
    'processed',
    'tyres',
  );
  const cacheFile = path.join(cacheDir, `${year}.json`);

  // 1. Try to read from cache
  try {
    const cachedData = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(cachedData);
  } catch (error) {
    // Cache miss
  }

  // Get all sessions for the year
  const allSessions = await getAllSessions(year);

  // Group by meeting
  const meetingsMap = new Map<
    number,
    Omit<TrackTyreInfo, 'compounds'> & { compounds: Set<string> }
  >();

  for (const session of allSessions) {
    if (!meetingsMap.has(session.meeting_key)) {
      meetingsMap.set(session.meeting_key, {
        meeting_key: session.meeting_key,
        meeting_name: session.country_name || session.location,
        location: session.location,
        country_code: session.country_code,
        date_start: session.date_start,
        date_end: session.date_end,
        compounds: new Set<string>(),
      });
    }

    const meeting = meetingsMap.get(session.meeting_key)!;

    // Update date range
    if (new Date(session.date_start) < new Date(meeting.date_start)) {
      meeting.date_start = session.date_start;
    }
    if (new Date(session.date_end) > new Date(meeting.date_end)) {
      meeting.date_end = session.date_end;
    }

    // If it's a race session, fetch tyre stints
    if (session.session_type.toLowerCase() === 'race') {
      meeting.race_session_key = session.session_key;
      const stints = await getTyreStints(session.session_key);

      // Add compounds to the set
      stints.forEach((stint) => {
        if (
          stint.compound === 'SOFT' ||
          stint.compound === 'MEDIUM' ||
          stint.compound === 'HARD'
        ) {
          meeting.compounds.add(stint.compound);
        }
      });
      // No manual delay needed
    }
  }

  // Convert to array and sort by date
  const finalData: TrackTyreInfo[] = Array.from(meetingsMap.values())
    .map((m) => ({
      ...m,
      compounds: Array.from(m.compounds),
    }))
    .sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );

  // Write to cache
  try {
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cacheFile, JSON.stringify(finalData, null, 2));
  } catch (error) {
    console.error('Failed to write tyre data cache', error);
  }

  return finalData;
}

export async function getTeamBattles(year: number): Promise<TeammateBattle[]> {
  const cacheDir = path.join(
    process.cwd(),
    'src',
    'data',
    'processed',
    'team-battles',
  );
  const cacheFile = path.join(cacheDir, `${year}.json`);

  // 1. Try to read from cache
  try {
    const cachedData = await fs.readFile(cacheFile, 'utf-8');
    return JSON.parse(cachedData);
  } catch (error) {
    // Cache miss
  }

  // Get all sessions for the year
  const allSessions = await getAllSessions(year);

  // Get driver info
  const drivers = await getSeasonDrivers(year);
  if (drivers.length === 0) return [];

  // Group drivers by team
  const teamMap = new Map<string, Driver[]>();
  drivers.forEach((driver) => {
    const teamName = driver.team_name;
    if (!teamMap.has(teamName)) {
      teamMap.set(teamName, []);
    }
    teamMap.get(teamName)!.push(driver);
  });

  // Filter to only teams with exactly 2 drivers (teammates)
  const teamsWithPairs = Array.from(teamMap.entries()).filter(
    ([_, driverList]) => driverList.length === 2,
  );

  // Get qualifying and race sessions
  const qualiSessions = allSessions.filter(
    (s) => s.session_type.toLowerCase() === 'qualifying',
  );
  const raceSessions = allSessions.filter(
    (s) => s.session_type.toLowerCase() === 'race',
  );

  // OPTIMIZATION: Fetch all session results ONCE instead of per team
  console.log(
    `Fetching ${qualiSessions.length} qualifying and ${raceSessions.length} race sessions...`,
  );

  const qualiResultsMap = new Map<number, SessionResult[]>();
  for (const quali of qualiSessions) {
    const results = await getSessionResults(quali.session_key);
    qualiResultsMap.set(quali.session_key, results);
  }

  const raceResultsMap = new Map<number, SessionResult[]>();
  for (const race of raceSessions) {
    const results = await getSessionResults(race.session_key);
    raceResultsMap.set(race.session_key, results);
  }

  console.log(
    `Fetched all session data. Computing battle stats for ${teamsWithPairs.length} teams...`,
  );

  // Now compute battle stats for each team using the cached results
  const battles: TeammateBattle[] = [];

  for (const [teamName, [driver1, driver2]] of teamsWithPairs) {
    const stats = {
      quali_battle: { driver1_wins: 0, driver2_wins: 0 },
      race_pace: {
        driver1_total: 0,
        driver2_total: 0,
        driver1_count: 0,
        driver2_count: 0,
      },
      points: { driver1_points: 0, driver2_points: 0 },
      consistency: { driver1_dnfs: 0, driver2_dnfs: 0, total_races: 0 },
      head_to_head: { driver1_ahead: 0, driver2_ahead: 0 },
      fastest_laps: { driver1_count: 0, driver2_count: 0 },
    };

    // Compute qualifying battles using cached data
    for (const quali of qualiSessions) {
      const results = qualiResultsMap.get(quali.session_key) || [];
      const d1Result = results.find(
        (r) => r.driver_number === driver1.driver_number,
      );
      const d2Result = results.find(
        (r) => r.driver_number === driver2.driver_number,
      );

      if (
        d1Result &&
        d2Result &&
        d1Result.position > 0 &&
        d2Result.position > 0
      ) {
        if (d1Result.position < d2Result.position) {
          stats.quali_battle.driver1_wins++;
        } else {
          stats.quali_battle.driver2_wins++;
        }
      }
    }

    // Compute race stats using cached data
    for (const race of raceSessions) {
      stats.consistency.total_races++;
      const results = raceResultsMap.get(race.session_key) || [];
      const d1Result = results.find(
        (r) => r.driver_number === driver1.driver_number,
      );
      const d2Result = results.find(
        (r) => r.driver_number === driver2.driver_number,
      );

      // Points
      if (d1Result) stats.points.driver1_points += d1Result.points || 0;
      if (d2Result) stats.points.driver2_points += d2Result.points || 0;

      // Race pace (average finishing position)
      if (d1Result && d1Result.position > 0) {
        stats.race_pace.driver1_total += d1Result.position;
        stats.race_pace.driver1_count++;
      } else if (d1Result) {
        stats.consistency.driver1_dnfs++;
      }

      if (d2Result && d2Result.position > 0) {
        stats.race_pace.driver2_total += d2Result.position;
        stats.race_pace.driver2_count++;
      } else if (d2Result) {
        stats.consistency.driver2_dnfs++;
      }

      // Head to head when both finish
      if (
        d1Result &&
        d2Result &&
        d1Result.position > 0 &&
        d2Result.position > 0
      ) {
        if (d1Result.position < d2Result.position) {
          stats.head_to_head.driver1_ahead++;
        } else {
          stats.head_to_head.driver2_ahead++;
        }
      }
    }

    // Calculate average race pace
    const driver1_avg =
      stats.race_pace.driver1_count > 0 ?
        stats.race_pace.driver1_total / stats.race_pace.driver1_count
      : 0;
    const driver2_avg =
      stats.race_pace.driver2_count > 0 ?
        stats.race_pace.driver2_total / stats.race_pace.driver2_count
      : 0;

    battles.push({
      team_name: teamName,
      team_colour: driver1.team_colour,
      driver1,
      driver2,
      quali_battle: stats.quali_battle,
      race_pace: { driver1_avg, driver2_avg },
      points: stats.points,
      consistency: stats.consistency,
      head_to_head: stats.head_to_head,
      fastest_laps: stats.fastest_laps,
    });
  }

  console.log(`Battle stats computed for all teams!`);

  // Write to cache
  try {
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cacheFile, JSON.stringify(battles, null, 2));
  } catch (error) {
    console.error('Failed to write team battles cache', error);
  }

  return battles;
}
