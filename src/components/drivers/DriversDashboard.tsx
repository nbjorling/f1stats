'use client';

import { DriverSeasonStats } from '@/lib/types';
import { PointsChart } from './PointsChart';
import DriverCards from './DriverCards';

interface DriversDashboardProps {
  seasonStats: DriverSeasonStats[];
  year?: number;
}

export function DriversDashboard({ seasonStats }: DriversDashboardProps) {
  // Extract latest driver info from stats for the cards, sorted by total points
  const currentDrivers = seasonStats
    .filter((stat) => !!stat.driver_info)
    .map((stat) => stat.driver_info!);

  return (
    <div className="container mx-auto space-y-8">
      <PointsChart data={seasonStats} nToShow={10} />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Current Standings</h2>
        <DriverCards drivers={currentDrivers} />
      </div>
    </div>
  );
}
