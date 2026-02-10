import { getSeasonTyreData } from '@/lib/openf1';
import { TrackTyreInfo } from '@/lib/types';
import { IconMapPin, IconCalendarEvent } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

interface TyresPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Tyre compound colors matching F1 standards
const TYRE_COLORS = {
  SOFT: 'bg-red-600',
  MEDIUM: 'bg-yellow-400',
  HARD: 'bg-white',
} as const;

const TYRE_GLOW = {
  SOFT: 'shadow-red-600/50',
  MEDIUM: 'shadow-yellow-400/50',
  HARD: 'shadow-white/50',
} as const;

const TYRE_TEXT = {
  SOFT: 'text-red-600',
  MEDIUM: 'text-yellow-400',
  HARD: 'text-white',
} as const;

function TyreIcon({
  compound,
  className,
}: {
  compound: 'SOFT' | 'MEDIUM' | 'HARD';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative group/tyre transition-all duration-300',
        className,
      )}
    >
      {/* Tyre outer ring */}
      <div
        className={cn(
          'w-20 h-20 rounded-full border-[6px] flex items-center justify-center transition-all duration-300',
          'group-hover/tyre:scale-110 group-hover/tyre:shadow-2xl',
          'border-zinc-900', // Dark rubber outline
          TYRE_COLORS[compound],
          TYRE_GLOW[compound],
        )}
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 0 2px #18181b', // Dark inner shadow and outer ring
        }}
      >
        {/* Inner hub */}
        <div className="w-8 h-8 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
        </div>
      </div>

      {/* Compound label */}
      <div
        className={cn(
          'absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap',
          TYRE_TEXT[compound],
        )}
      >
        {compound}
      </div>
    </div>
  );
}

export default async function TyresPage({ searchParams }: TyresPageProps) {
  const sp = await searchParams;
  const yearParam = sp?.year;
  const year = typeof yearParam === 'string' ? parseInt(yearParam, 10) : 2026;

  const trackTyres = await getSeasonTyreData(year);
  const availableYears = [2026, 2025, 2024, 2023];

  return (
    <div className="flex h-screen flex-col bg-black text-white selection:bg-red-900 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 font-bold text-white shadow-lg shadow-purple-900/20">
              🏁
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                F1 Tyre Strategy
              </h1>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <div className="flex gap-1 bg-zinc-900/50 rounded-lg p-0.5 border border-zinc-800">
                  {availableYears.map((y) => (
                    <Link
                      key={y}
                      href={`/tyres?year=${y}`}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Info Banner */}
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border border-purple-800/30 p-6 backdrop-blur-sm">
            <h2 className="text-lg font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tyre Compounds Overview
            </h2>
            <p className="text-sm text-zinc-400 mb-4">
              Each race weekend features three dry tyre compounds selected by
              Pirelli. The compounds shown are based on actual race data.
            </p>

            {/* Compound Range */}
            <div className="flex items-start gap-4 bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-yellow-400">
                  <span className="text-lg font-bold">C</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white mb-2">
                  Compound Range: C1 to C5
                </h3>
                <p className="text-xs text-zinc-400 mb-2">
                  Pirelli brings five compounds (C1-C5) to each season, with C1
                  being the hardest and C5 the softest.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-zinc-900" />
                    <span className="text-zinc-500">C1/C2</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-zinc-900" />
                    <span className="text-zinc-500">C2/C3/C4</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-600 border-2 border-zinc-900" />
                    <span className="text-zinc-500">C3/C4/C5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Track Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trackTyres.map((track) => {
              const compounds = Array.from(track.compounds).sort((a, b) => {
                const order = { SOFT: 0, MEDIUM: 1, HARD: 2 };
                return (
                  order[a as keyof typeof order] -
                  order[b as keyof typeof order]
                );
              }) as ('SOFT' | 'MEDIUM' | 'HARD')[];

              return (
                <Card
                  key={track.meeting_key}
                  className={cn(
                    'group overflow-hidden border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500',
                    'hover:-translate-y-2 hover:border-zinc-700 hover:shadow-2xl hover:shadow-purple-900/20',
                  )}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 opacity-0 transition-opacity duration-500 group-hover:from-purple-600/10 group-hover:via-pink-600/10 group-hover:to-purple-600/10 group-hover:opacity-100" />

                  <div className="relative z-10 p-6">
                    {/* Track Header */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-zinc-800 text-xl font-black text-zinc-600">
                          {track.country_code}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">
                            {track.meeting_name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <IconMapPin size={12} />
                            <span className="truncate">{track.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <IconCalendarEvent size={12} />
                        <span>
                          {format(parseISO(track.date_start), 'MMM d')} -{' '}
                          {format(parseISO(track.date_end), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Tyre Compounds */}
                    <div className="space-y-4">
                      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Available Compounds
                      </div>

                      {compounds.length > 0 ?
                        <div className="flex justify-center gap-6 py-4">
                          {compounds.map((compound) => (
                            <TyreIcon key={compound} compound={compound} />
                          ))}
                        </div>
                      : <div className="text-center py-8 text-zinc-600 italic text-sm">
                          No tyre data available
                        </div>
                      }
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty state */}
          {trackTyres.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏎️</div>
              <h3 className="text-xl font-bold text-zinc-400 mb-2">
                No data available
              </h3>
              <p className="text-sm text-zinc-600">
                Tyre data for {year} is not yet available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
