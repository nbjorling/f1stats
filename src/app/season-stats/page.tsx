import { Suspense } from 'react';
import { getSeasonPoints } from '@/lib/openf1';
import { DriversDashboard } from '@/components/drivers/DriversDashboard';

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function DriversPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : 2024;
  const seasonStats = await getSeasonPoints(year);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 mx-8">
        <h1 className="text-3xl font-bold">F1 {year} Drivers Championship</h1>
        <div className="flex gap-2">
          {[2024, 2025].map((y) => (
            <a
              key={y}
              href={`/drivers?year=${y}`}
              className={`px-4 py-2 rounded-lg transition-colors ${
                year === y
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </div>
      <p className="text-gray-400 mb-4 mx-8">
        Track the points progression of every driver throughout the {year} season.
      </p>

      <Suspense fallback={<div className="p-10 text-center">Loading F1 Data...</div>}>
         <DriversDashboard seasonStats={seasonStats} year={year} />
      </Suspense>
    </div>
  );
}
