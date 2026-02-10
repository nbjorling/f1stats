import { getTeamBattles, getSeasonPoints } from '@/lib/openf1';
import { getDriverStandingsRaw } from '@/lib/data-loader';
import { TeammateBattle } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Icon, Trophy } from 'lucide-react';
import { BattleMetric } from '@/components/team-battles/battle-metric';
import { DriverComparison } from '@/components/team-battles/driver-comparison';

interface TeamBattlesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function TeamBattleCard({ battle }: { battle: TeammateBattle }) {
  const totalQuali =
    battle.quali_battle.driver1_wins + battle.quali_battle.driver2_wins;
  const totalH2H =
    battle.head_to_head.driver1_ahead + battle.head_to_head.driver2_ahead;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6',
        'transition-all duration-500 hover:-translate-y-2 hover:border-zinc-700 hover:shadow-2xl hover:shadow-purple-900/20 backdrop-blur-sm',
      )}
    >
      {/* Team color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-70"
        style={{ backgroundColor: `#${battle.team_colour}` }}
      />

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-pink-600/0 to-purple-600/0 opacity-0 transition-opacity duration-500 group-hover:from-purple-600/5 group-hover:via-pink-600/5 group-hover:to-purple-600/5 group-hover:opacity-100" />

      <div className="relative z-10 space-y-6">
        {/* Team Header */}
        <div className="text-center">
          <h3 className="text-lg font-black uppercase tracking-tight text-white/90">
            {battle.team_name}
          </h3>
          <div className="mt-1 text-xs font-medium text-zinc-500">
            {battle.consistency.total_races} race
            {battle.consistency.total_races !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Driver Headshots and Names */}
        <div className="grid grid-cols-2 gap-4">
          {/* Driver 1 */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:border-green-500/50">
              <Image
                src={battle.driver1.headshot_url || '/placeholder-driver.png'}
                alt={battle.driver1.full_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">
                {battle.driver1.name_acronym}
              </div>
              <div className="text-xs text-zinc-500">
                {battle.driver1.last_name}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:border-purple-500/50">
              <Image
                src={battle.driver2.headshot_url || '/placeholder-driver.png'}
                alt={battle.driver2.full_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">
                {battle.driver2.name_acronym}
              </div>
              <div className="text-xs text-zinc-500">
                {battle.driver2.last_name}
              </div>
            </div>
          </div>
        </div>

        {/* Battle Metrics */}
        <div className="space-y-4 rounded-xl bg-black/30 p-4">
          <BattleMetric
            label="Qualifying Battle"
            driver1Score={battle.quali_battle.driver1_wins}
            driver2Score={battle.quali_battle.driver2_wins}
            driver1Name={battle.driver1.name_acronym}
            driver2Name={battle.driver2.name_acronym}
          />

          <BattleMetric
            label="Points"
            driver1Score={battle.points.driver1_points}
            driver2Score={battle.points.driver2_points}
            driver1Name={battle.driver1.name_acronym}
            driver2Name={battle.driver2.name_acronym}
          />

          {totalH2H > 0 && (
            <BattleMetric
              label="Head-to-Head"
              driver1Score={battle.head_to_head.driver1_ahead}
              driver2Score={battle.head_to_head.driver2_ahead}
              driver1Name={battle.driver1.name_acronym}
              driver2Name={battle.driver2.name_acronym}
            />
          )}

          {battle.race_pace.driver1_avg > 0 &&
            battle.race_pace.driver2_avg > 0 && (
              <BattleMetric
                label="Avg Finish Position"
                driver1Score={battle.race_pace.driver1_avg}
                driver2Score={battle.race_pace.driver2_avg}
                driver1Name={battle.driver1.name_acronym}
                driver2Name={battle.driver2.name_acronym}
                reverse={true}
              />
            )}

          {/* DNF Count */}
          {(battle.consistency.driver1_dnfs > 0 ||
            battle.consistency.driver2_dnfs > 0) && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800">
              <span className="font-medium text-zinc-400">DNFs</span>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'font-bold',
                    (
                      battle.consistency.driver1_dnfs >
                        battle.consistency.driver2_dnfs
                    ) ?
                      'text-green-400'
                    : 'text-zinc-500',
                  )}
                >
                  {battle.consistency.driver1_dnfs}
                </span>
                <span className="text-zinc-600">-</span>
                <span
                  className={cn(
                    'font-bold',
                    (
                      battle.consistency.driver2_dnfs >
                        battle.consistency.driver1_dnfs
                    ) ?
                      'text-green-400'
                    : 'text-zinc-500',
                  )}
                >
                  {battle.consistency.driver2_dnfs}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Overall Winner Badge */}
        {battle.points.driver1_points !== battle.points.driver2_points && (
          <div className="flex items-center justify-center">
            <div
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-bold',
                battle.points.driver1_points > battle.points.driver2_points ?
                  'bg-gradient-to-r from-green-600 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
              )}
            >
              {battle.points.driver1_points > battle.points.driver2_points ?
                `${battle.driver1.name_acronym} Leading`
              : `${battle.driver2.name_acronym} Leading`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function TeamBattlesPage({
  searchParams,
}: TeamBattlesPageProps) {
  const sp = await searchParams;
  const yearParam = sp?.year;
  const year = typeof yearParam === 'string' ? parseInt(yearParam, 10) : 2025;

  const battles = await getTeamBattles(year);
  const standings = await getSeasonPoints(year);

  const availableYears = [2026, 2025, 2024, 2023];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-green-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 font-bold text-white shadow-lg shadow-green-900/20">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Team Battles
              </h1>
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-0.5">
                  {availableYears.map((y) => (
                    <Link
                      key={y}
                      href={`/team-battles?year=${y}`}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Info Banner */}
          <div className="mb-4 rounded-2xl border border-green-800/30 bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20 p-6 backdrop-blur-sm">
            <h2 className="mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-lg font-bold text-transparent">
              Teammate Head-to-Head Analysis
            </h2>
            <p className="text-sm text-zinc-400">
              Multi-dimensional comparison of teammates across qualifying, race
              performance, points, and consistency. Each metric shows who&apos;s
              winning the internal team battle.
            </p>
          </div>
          {standings && <DriverComparison standings={standings} />}

          {/* Battle Cards Grid */}
          {battles.length > 0 ?
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {battles.map((battle) => (
                <TeamBattleCard key={battle.team_name} battle={battle} />
              ))}
            </div>
          : <div className="py-20 text-center">
              <div className="mb-4 text-6xl">🏎️</div>
              <h3 className="mb-2 text-xl font-bold text-zinc-400">
                No data available
              </h3>
              <p className="text-sm text-zinc-600">
                Team battle data for {year} is not yet available.
              </p>
            </div>
          }
        </div>
      </div>

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-green-600/10 blur-[120px]" />
        <div className="delay-1000 absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>
    </div>
  );
}
