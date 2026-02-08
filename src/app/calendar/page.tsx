import { getAllSessions, getSessionTop3, getSeasonDrivers } from '@/lib/openf1';
import { Session, SessionResult, Driver } from '@/lib/types';
import { IconMapPin, IconCalendarEvent } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { format, parseISO, isPast } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

// Helper to group sessions by meeting
interface RaceWeekend {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_code: string;
  sessions: Session[];
  date_start: string;
  date_end: string;
  results: { [sessionKey: number]: any[] };
}

async function getCalendarData(year: number) {
  let driversMap = new Map<number, Driver>();
  let cachedWeekends: RaceWeekend[] | null = null;

  // 1. Fetch Drivers (uses new caching)
  try {
    const drivers = await getSeasonDrivers(year);
    drivers.forEach((d) => driversMap.set(d.driver_number, d));
  } catch (e) {
    console.error('Failed to fetch drivers', e);
  }

  // 2. Check for cached calendar file
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const cacheFile = path.join(
      process.cwd(),
      'src',
      'data',
      'seasons',
      `${year}.json`,
    );
    const fileContent = await fs.readFile(cacheFile, 'utf-8');
    cachedWeekends = JSON.parse(fileContent) as RaceWeekend[];
  } catch (e) {
    // console.log("Cache miss for year " + year);
  }

  if (cachedWeekends) {
    return { weekends: cachedWeekends, drivers: driversMap };
  }

  // Fallback to API if no cache (or if we want to build it fresh)
  const allSessions = await getAllSessions(year);

  // Group by meeting_key
  const weekends: { [key: number]: RaceWeekend } = {};

  for (const session of allSessions) {
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

    // Update weekend date range
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

  // Convert to array and sort
  const sortedWeekends = Object.values(weekends).sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );

  // Fetch results for past main sessions
  const resultPromises: Promise<void>[] = [];

  for (const weekend of sortedWeekends) {
    weekend.sessions.sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );

    for (const session of weekend.sessions) {
      const isQuali = session.session_name.toLowerCase().includes('qualifying');
      const isRace = session.session_type.toLowerCase() === 'race';

      if ((isQuali || isRace) && isPast(parseISO(session.date_end))) {
        resultPromises.push(
          getSessionTop3(session.session_key).then((res) => {
            weekend.results[session.session_key] = res;
          }),
        );
      }
    }
  }

  await Promise.all(resultPromises);

  return { weekends: sortedWeekends, drivers: driversMap };
}

function formatDuration(seconds: number): string {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  const remSeconds = (seconds % 60).toFixed(3);
  const parts = remSeconds.split('.');
  return `${minutes}:${parts[0].padStart(2, '0')}.${parts[1]}`;
}

function formatResultTime(
  result: any,
  sessionType: 'Qualifying' | 'Race',
  position: number,
) {
  // Safe access to data which might be array (some APIs return history of lap times) or number
  // OpenF1 usually returns numbers for duration/gap, but sometimes arrays for lap history.
  // We assume the API returns the *best* time or gap as a single value or we take the last one.

  // Check if property exists first
  const durationVal = result.duration;

  if (position === 1) {
    // Winner/Pole: Show Time
    let time = 0;
    if (Array.isArray(durationVal)) {
      time = durationVal[durationVal.length - 1]; // Take last lap? Or best? For quali it might be list of sector times?
      // Actually OpenF1 session_result duration for Race is total time (number).
      // For Quali it might be list of lap times?
      // If array, sum it? No.
      // Let's assume number if simple.
      // If array, let's take the *last* value as checking prior usage implies it might be laps.
      // But if it's race duration, it should be a big number.
    } else {
      time = durationVal;
    }
    return formatDuration(time);
  } else {
    // Others: Show Gap
    const gapVal = result.gap_to_leader;
    if (gapVal === undefined || gapVal === null) return '';

    let gap = 0;
    if (Array.isArray(gapVal)) {
      gap = gapVal[gapVal.length - 1];
    } else {
      gap = gapVal;
    }

    return `+ ${Number(gap).toFixed(3)}s`;
  }
}

interface CalendarPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CalendarPage({
  searchParams,
}: CalendarPageProps) {
  const sp = await searchParams;
  const yearParam = sp?.year;
  const year = typeof yearParam === 'string' ? parseInt(yearParam, 10) : 2026;

  // Use await here effectively
  const { weekends, drivers } = await getCalendarData(year);

  const availableYears = [2026, 2025, 2024, 2023];

  return (
    <div className="flex h-screen flex-col bg-black text-white selection:bg-red-900 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 font-bold text-white shadow-lg shadow-red-900/20">
              {year.toString().slice(2)}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">F1 Calendar</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <span>Season {year}</span>
                <div className="flex gap-1 bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800">
                  {availableYears.map((y) => (
                    <Link
                      key={y}
                      href={`/calendar?year=${y}`}
                      className={cn(
                        'px-2 py-0.5 rounded transition-colors hover:text-white',
                        year === y ? 'bg-zinc-700 text-white' : 'text-zinc-500',
                      )}
                    >
                      {y}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-white transition-colors"
          >
            Back
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {weekends.map((weekend) => {
            const isPastWeekend = isPast(parseISO(weekend.date_end));

            return (
              <Card
                key={weekend.meeting_key}
                className={cn(
                  'overflow-hidden border-zinc-800 bg-zinc-900/40 transition-all',
                  isPastWeekend ? 'opacity-100' : 'hover:border-zinc-700',
                )}
              >
                {/* Meeting Header */}
                <div className="border-b border-zinc-800/50 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-zinc-800 text-xl font-black text-zinc-600">
                      {weekend.country_code}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {weekend.meeting_name}
                        {isPastWeekend && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
                            COMPLETED
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <IconMapPin size={14} /> {weekend.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconCalendarEvent size={14} />{' '}
                          {format(parseISO(weekend.date_start), 'MMM d')} -{' '}
                          {format(parseISO(weekend.date_end), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="divide-y divide-zinc-800/50">
                  {weekend.sessions.map((session) => {
                    const results = weekend.results[session.session_key];
                    const isRace =
                      session.session_type.toLowerCase() === 'race';
                    const isQuali = session.session_type
                      .toLowerCase()
                      .includes('qualifying');

                    if (session.session_type.toLowerCase() === 'practice') {
                      return null;
                    }

                    const sessionType = isRace ? 'Race' : 'Qualifying';

                    return (
                      <div
                        key={session.session_key}
                        className="p-3 sm:p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex flex-col gap-4">
                          {/* Session Info */}
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                isRace &&
                                  'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
                                isQuali && 'bg-yellow-500',
                                !isQuali && !isRace && 'bg-zinc-600',
                              )}
                            />
                            <div className="flex justify-between w-full items-center">
                              <div className="font-semibold text-sm text-zinc-200">
                                {session.session_name}
                              </div>
                              <div className="text-xs text-zinc-500 font-mono">
                                {format(
                                  parseISO(session.date_start),
                                  'EEE HH:mm',
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Results (New Design) */}
                          {results && results.length > 0 ?
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {results.map((res: any, idx: number) => {
                                const driver = drivers.get(res.driver_number);
                                const timeDisplay = formatResultTime(
                                  res,
                                  sessionType,
                                  res.position,
                                );
                                const driverName =
                                  driver ?
                                    driver.full_name
                                  : `Driver ${res.driver_number}`;
                                // If driver not found, fallback to placeholder?
                                const headshot = driver?.headshot_url;

                                return (
                                  <div
                                    key={res.driver_number}
                                    className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/30 border border-zinc-800/50"
                                  >
                                    {/* Position */}
                                    <div
                                      className={cn(
                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold',
                                        res.position === 1 ?
                                          'bg-yellow-500 text-black'
                                        : res.position === 2 ?
                                          'bg-zinc-400 text-black'
                                        : res.position === 3 ?
                                          'bg-orange-600 text-white'
                                        : 'bg-zinc-800 text-zinc-400',
                                      )}
                                    >
                                      {res.position}
                                    </div>

                                    {/* Image & Driver */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      {/* Headshot Circle */}
                                      <div className="h-8 w-8 relative overflow-hidden rounded-full bg-zinc-800 border border-zinc-700 shrink-0">
                                        {headshot ?
                                          <Image
                                            src={headshot}
                                            alt={driverName}
                                            fill
                                            className="object-cover object-top pt-1"
                                            sizes="32px"
                                          />
                                        : <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                                            #{res.driver_number}
                                          </div>
                                        }
                                      </div>

                                      <div className="flex flex-col min-w-0">
                                        <div className="text-xs font-bold text-white truncate w-full">
                                          <span className="text-zinc-500 mr-1.5 font-mono text-[10px]">
                                            #{res.driver_number}
                                          </span>
                                          {driver?.name_acronym || driverName}
                                        </div>
                                        <div className="text-[10px] text-emerald-400 font-mono font-medium">
                                          {timeDisplay}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          : isPastWeekend ?
                            <div className="text-xs text-zinc-600 italic pl-5">
                              Results pending...
                            </div>
                          : <div className="text-xs text-zinc-600 italic pl-5">
                              Upcoming
                            </div>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
