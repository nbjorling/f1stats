import fs from 'fs/promises';
import path from 'path';

// Types (simplified for script)
interface Session {
  session_key: number;
  meeting_key: number;
  date_start: string;
  date_end: string;
  location: string;
  session_name: string;
  session_type: string;
  country_code: string;
  country_name: string;
  circuit_short_name: string;
  gmt_offset: string;
  year: number;
}

interface RaceWeekend {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_code: string;
  sessions: Session[];
  date_start: string;
  date_end: string;
  // Raw API sessions doesn't include results, but we can store them here if we want
  // For now, let's keep it clean as "Schedule with Sessions"
}

const API_BASE = 'https://api.openf1.org/v1';

// We will use the shared API client instead of reimplementing it
import { openF1Client } from '../src/lib/api-client';

// Map client fetch to local usage if needed, or just replace calls
const fetchWithRetry = async (url: string) => {
  return openF1Client.fetch(url.replace('https://api.openf1.org/v1', ''));
};

async function fetchSeason(year: number) {
  console.log(`Fetching season ${year}...`);

  // 1. Fetch Sessions
  const sessions = await openF1Client.fetch<Session[]>(
    `/sessions?year=${year}`,
  );
  console.log(`Found ${sessions.length} sessions.`);

  // Group into weekends
  const weekends: Record<number, RaceWeekend> = {};

  for (const session of sessions) {
    if (!weekends[session.meeting_key]) {
      weekends[session.meeting_key] = {
        meeting_key: session.meeting_key,
        meeting_name: session.country_name || session.location,
        location: session.location,
        country_code: session.country_code,
        sessions: [],
        date_start: session.date_start,
        date_end: session.date_end,
      };
    }
    weekends[session.meeting_key].sessions.push(session);

    // Update dates
    if (
      new Date(session.date_start) <
      new Date(weekends[session.meeting_key].date_start)
    ) {
      weekends[session.meeting_key].date_start = session.date_start;
    }
    if (
      new Date(session.date_end) >
      new Date(weekends[session.meeting_key].date_end)
    ) {
      weekends[session.meeting_key].date_end = session.date_end;
    }
  }

  const sortedWeekends = Object.values(weekends).sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );

  // Save Season Data
  const seasonDir = path.join(process.cwd(), 'src', 'data', 'raw', 'seasons');
  await fs.mkdir(seasonDir, { recursive: true });
  await fs.writeFile(
    path.join(seasonDir, `${year}.json`),
    JSON.stringify(sortedWeekends, null, 2),
  );
  console.log(`Saved season ${year} to raw/seasons/${year}.json`);

  // 2. Fetch Drivers (from last session)
  if (sortedWeekends.length > 0) {
    const lastWeekend = sortedWeekends[sortedWeekends.length - 1];
    // Sort sessions in weekend
    lastWeekend.sessions.sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );
    const lastSession = lastWeekend.sessions[lastWeekend.sessions.length - 1];

    console.log(`Fetching drivers from session ${lastSession.session_key}...`);
    const drivers = await openF1Client.fetch<any[]>(
      `/drivers?session_key=${lastSession.session_key}`,
    );

    // Save Drivers Data
    const driverDir = path.join(process.cwd(), 'src', 'data', 'raw', 'drivers');
    await fs.mkdir(driverDir, { recursive: true });
    await fs.writeFile(
      path.join(driverDir, `${year}.json`),
      JSON.stringify(drivers, null, 2),
    );
    console.log(`Saved drivers ${year} to raw/drivers/${year}.json`);
  }
}

async function main() {
  const years = [2023, 2024, 2025];
  for (const year of years) {
    await fetchSeason(year);
    // Pause between years
    await new Promise((r) => setTimeout(r, 1000));
  }
}

main().catch(console.error);
