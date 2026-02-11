'use client';

import { useState, useMemo } from 'react';
import { DriverSeasonStats } from '@/lib/types';
import { BattleMetric } from './battle-metric';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChevronDown, Swords, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

interface DriverComparisonProps {
  standings: DriverSeasonStats[];
}

export function DriverComparison({ standings }: DriverComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Default to top 2 drivers if available
  const [driver1Id, setDriver1Id] = useState<string>(
    standings[0]?.driver_number.toString() || '',
  );
  const [driver2Id, setDriver2Id] = useState<string>(
    standings[1]?.driver_number.toString() || '',
  );

  const drivers = useMemo(() => {
    return standings
      .filter((s) => s.driver_info)
      .map((s) => ({
        id: s.driver_number.toString(),
        name: s.driver_info!.name_acronym,
        full_name: s.driver_info!.last_name,
        team: s.driver_info!.team_name,
        image: s.driver_info!.headshot_url,
      }));
  }, [standings]);

  const driver1 = standings.find(
    (s) => s.driver_number.toString() === driver1Id,
  );
  const driver2 = standings.find(
    (s) => s.driver_number.toString() === driver2Id,
  );

  const stats = useMemo(() => {
    if (!driver1 || !driver2) return null;

    const d1 = driver1;
    const d2 = driver2;

    // Calculate Head to Head
    // We iterate through history. We need to match by meeting_key.
    // Assuming history is sorted or at least contains meeting_keys.

    let d1RaceWins = 0;
    let d2RaceWins = 0;

    // Create a map for driver 2 results for fast lookup
    const d2Results = new Map(d2.history.map((r) => [r.meeting_key, r]));

    d1.history.forEach((r1) => {
      const r2 = d2Results.get(r1.meeting_key);
      if (r2) {
        // Both participated in the meeting
        // Check race positions.
        const p1 = r1.position;
        const p2 = r2.position;

        // Logic:
        // If both valid positions (status="Finished" usually implied by existing position?)
        // In OpenF1, position is null if no result?
        // Let's assume non-null/non-zero is a finish or classified result.
        // Actually, simplified H2H: purely based on position number if both exist.

        if (p1 && p2) {
          if (p1 < p2) d1RaceWins++;
          else if (p2 < p1) d2RaceWins++;
        }
      }
    });

    // Best Finish
    const d1Best = Math.min(
      ...d1.history.filter((r) => r.position > 0).map((r) => r.position),
    );
    const d2Best = Math.min(
      ...d2.history.filter((r) => r.position > 0).map((r) => r.position),
    );

    // Qualifying H2H
    let d1QualiWins = 0;
    let d2QualiWins = 0;
    const d2QualiMap = new Map(
      (d2.qualifying_history || []).map((q) => [q.meeting_key, q]),
    );

    (d1.qualifying_history || []).forEach((q1) => {
      const q2 = d2QualiMap.get(q1.meeting_key);
      if (q2 && q1.position > 0 && q2.position > 0) {
        if (q1.position < q2.position) d1QualiWins++;
        else if (q2.position < q1.position) d2QualiWins++;
      }
    });

    // Avg Finish
    const d1Finishes = d1.history.filter((r) => r.is_classified);
    const d2Finishes = d2.history.filter((r) => r.is_classified);

    const d1AvgFinish =
      d1Finishes.length > 0 ?
        d1Finishes.reduce((sum, r) => sum + r.position, 0) / d1Finishes.length
      : 0;
    const d2AvgFinish =
      d2Finishes.length > 0 ?
        d2Finishes.reduce((sum, r) => sum + r.position, 0) / d2Finishes.length
      : 0;

    // DNFs / DNS
    const d1Dnfs = d1.history.filter((r) => !r.is_classified).length;
    const d2Dnfs = d2.history.filter((r) => !r.is_classified).length;

    return {
      points: {
        d1: d1.total_points,
        d2: d2.total_points,
      },
      raceH2H: {
        d1: d1RaceWins,
        d2: d2RaceWins,
      },
      qualiH2H: {
        d1: d1QualiWins,
        d2: d2QualiWins,
      },
      bestFinish: {
        d1: d1Best === Infinity ? 0 : d1Best,
        d2: d2Best === Infinity ? 0 : d2Best,
      },
      avgFinish: {
        d1: d1AvgFinish,
        d2: d2AvgFinish,
      },
      dnfs: {
        d1: d1Dnfs,
        d2: d2Dnfs,
      },
    };
  }, [driver1, driver2]);

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-4 transition-all hover:bg-zinc-800/50 hover:border-zinc-700"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <Swords className="h-5 w-5 text-blue-400" />
        <span className="font-semibold text-zinc-300 group-hover:text-white">
          Compare Drivers
        </span>
      </button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-white">
                Driver Face-Off
              </Dialog.Title>
              <Dialog.Close className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Driver 1 Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase">
                  Driver 1
                </label>
                <div className="relative">
                  <select
                    value={driver1Id}
                    onChange={(e) => setDriver1Id(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} -{' '}
                        {d.name === d.full_name ? d.team : d.full_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Driver 2 Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-500 uppercase">
                  Driver 2
                </label>
                <div className="relative">
                  <select
                    value={driver2Id}
                    onChange={(e) => setDriver2Id(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 pr-10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} -{' '}
                        {d.name === d.full_name ? d.team : d.full_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {driver1?.driver_info && driver2?.driver_info && stats && (
              <div className="mt-6 rounded-xl bg-zinc-900/50 p-6 border border-zinc-800">
                {/* Heads */}
                <div className="flex justify-between items-end mb-8">
                  <div className="flex flex-col items-center">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-blue-500/50 bg-zinc-800 mb-2">
                      <Image
                        src={
                          driver1.driver_info.headshot_url || '/placeholder.png'
                        }
                        alt="D1"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="font-bold text-lg">
                      {driver1.driver_info.name_acronym}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {driver1.driver_info.team_name}
                    </span>
                  </div>
                  <div className="pb-8">
                    <span className="text-2xl font-black italic text-zinc-700">
                      VS
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-purple-500/50 bg-zinc-800 mb-2">
                      <Image
                        src={
                          driver2.driver_info.headshot_url || '/placeholder.png'
                        }
                        alt="D1"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className="font-bold text-lg">
                      {driver2.driver_info.name_acronym}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {driver2.driver_info.team_name}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-6">
                  <BattleMetric
                    label="Season Points"
                    driver1Score={stats.points.d1}
                    driver2Score={stats.points.d2}
                    driver1Name={driver1.driver_info.name_acronym}
                    driver2Name={driver2.driver_info.name_acronym}
                  />
                  <BattleMetric
                    label="Race Head-to-Head"
                    driver1Score={stats.raceH2H.d1}
                    driver2Score={stats.raceH2H.d2}
                    driver1Name={driver1.driver_info.name_acronym}
                    driver2Name={driver2.driver_info.name_acronym}
                  />
                  <BattleMetric
                    label="Qualifying Head-to-Head"
                    driver1Score={stats.qualiH2H.d1}
                    driver2Score={stats.qualiH2H.d2}
                    driver1Name={driver1.driver_info.name_acronym}
                    driver2Name={driver2.driver_info.name_acronym}
                  />
                  <BattleMetric
                    label="Best Race Finish"
                    driver1Score={stats.bestFinish.d1}
                    driver2Score={stats.bestFinish.d2}
                    driver1Name={driver1.driver_info.name_acronym}
                    driver2Name={driver2.driver_info.name_acronym}
                    reverse={true}
                  />
                  <BattleMetric
                    label="Average Race Finish"
                    driver1Score={Number(stats.avgFinish.d1.toFixed(1))}
                    driver2Score={Number(stats.avgFinish.d2.toFixed(1))}
                    driver1Name={driver1.driver_info.name_acronym}
                    driver2Name={driver2.driver_info.name_acronym}
                    reverse={true}
                  />
                  <BattleMetric
                    label="DNFs / DNSs"
                    driver1Score={stats.dnfs.d1}
                    driver2Score={stats.dnfs.d2}
                    driver1Name={driver1.driver_info.name_acronym}
                    driver2Name={driver2.driver_info.name_acronym}
                    reverse={true}
                  />
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
