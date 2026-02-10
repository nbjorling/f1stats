import { Suspense } from 'react';
import { getSeasonPoints } from '@/lib/openf1';
import { DriversDashboard } from '@/components/drivers/DriversDashboard';
import { TrophyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function DriversPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : 2024;
  const seasonStats = await getSeasonPoints(year);
  const availableYears = [2024, 2025];
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-orange-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 font-bold text-white shadow-lg shadow-orange-900/20">
              <TrophyIcon />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                F1 Drivers Championship
              </h1>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
                  {availableYears.map((y) => (
                    <Link
                      key={y}
                      href={`/season-stats?year=${y}`}
                      className={cn(
                        'rounded px-2 py-0.5 transition-colors hover:text-white',
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
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-white"
          >
            Back
          </Link>
        </div>
      </header>
      <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="rounded-2xl border border-orange-800/30 bg-gradient-to-r from-orange-900/20 via-red-900/20 to-orange-900/20 p-6 backdrop-blur-sm">
          <h2 className="mb-3 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-lg font-bold text-transparent">
            F1 {year} Drivers Championship
          </h2>
          <p className="text-sm text-zinc-400">
            Track the points progression of every driver throughout the {year}{' '}
            season.
          </p>
        </div>

        <Suspense
          fallback={<div className="p-10 text-center">Loading F1 Data...</div>}
        >
          <DriversDashboard seasonStats={seasonStats} year={year} />
        </Suspense>
      </div>
    </div>
  );
}
