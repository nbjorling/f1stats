import fs from 'fs/promises';
import path from 'path';

// Define types locally/minimally to avoid import issues or copy from types.ts
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

interface SessionResult {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  position: number;
  points: number;
  name_acronym?: string;
  team_colour?: string;
  time?: string;
  gap_to_leader?: string;
}

interface RaceWeekend {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_code: string;
  sessions: Session[];
  date_start: string;
  date_end: string;
  results: { [sessionKey: number]: SessionResult[] };
}

const API_BASE = 'https://api.openf1.org/v1';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      if (res.status === 429) {
        console.log(`Rate limit hit. Waiting ${2000 * (i + 1)}ms...`);
        await delay(2000 * (i + 1));
        continue;
      }
      throw new Error(`Status ${res.status}`);
    } catch (e) {
      console.error(`Fetch error: ${e}. Retry ${i + 1}/${retries}`);
      await delay(1000);
    }
  }
  return [];
}

async function getSessionTop3(sessionKey: number): Promise<SessionResult[]> {
  const data: SessionResult[] = await fetchWithRetry(
    `${API_BASE}/session_result?session_key=${sessionKey}`,
  );
  return data
    .sort((a, b) => a.position - b.position)
    .filter((r) => r.position > 0 && r.position <= 3)
    .slice(0, 3);
}

async function cacheSeason(year: number) {
  console.log(`Starting cache for ${year}...`);
  const sessions: Session[] = await fetchWithRetry(
    `${API_BASE}/sessions?year=${year}`,
  );
  console.log(`Found ${sessions.length} sessions for ${year}.`);

  // Group into weekends
  const weekends: { [key: number]: RaceWeekend } = {};

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
        results: {},
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

  // Convert to sorted array
  const sortedWeekends = Object.values(weekends).sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );

  // Fetch results
  console.log(`Processing ${sortedWeekends.length} weekends...`);
  let totalProcessed = 0;

  for (const weekend of sortedWeekends) {
    // Sort sessions
    weekend.sessions.sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );

    for (const session of weekend.sessions) {
      const isQuali = session.session_name.toLowerCase().includes('qualifying');
      const isRace = session.session_type.toLowerCase() === 'race';

      // For past years (which this script is for), all sessions in the list are essentially "past" or relevant.
      // But we only want results for Quali and Race.
      if (isQuali || isRace) {
        process.stdout.write(
          `Fetching results for ${session.session_name} (${year})... `,
        );
        const results = await getSessionTop3(session.session_key);
        process.stdout.write(`Done. Found ${results.length}.\n`);

        if (results.length > 0) {
          weekend.results[session.session_key] = results;
        }

        // Rate limit spacing
        // We do about 2 requests per second max.
        // fetchWithRetry waits if 429.
        // Let's add a small fixed delay to be safe.
        await delay(600);
      }
    }
    totalProcessed++;
    console.log(
      `Weekend ${totalProcessed}/${sortedWeekends.length} processed.`,
    );
  }

  // Save to file
  const outputPath = path.join(
    process.cwd(),
    'src',
    'data',
    'seasons',
    `${year}.json`,
  );
  await fs.writeFile(outputPath, JSON.stringify(sortedWeekends, null, 2));
  console.log(`Saved ${year} data to ${outputPath}`);
}

async function main() {
  const years = [2023, 2024, 2025];

  for (const year of years) {
    await cacheSeason(year);
    // Pause between years
    await delay(2000);
  }
  console.log('All done!');
}

main().catch(console.error);
