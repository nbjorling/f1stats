'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DriverSeasonStats } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PointsChartProps {
  data: DriverSeasonStats[];
  nToShow?: number;
}

export function PointsChart({ data, nToShow = 10 }: PointsChartProps) {
  // Transform data for Recharts: Array of objects where key is driver name/code and value is points at that race
  // We need an array of races (x-axis)

  const chartData = useMemo(() => {
    if (!data.length) return [];

    // 1. Collect all unique meetings/races from the first driver (assuming all drove same races or we handle gaps)
    // Using the driver with most history to define the timeline might be safer
    const referenceDriver = data.find(d => d.history.length > 0);
    if (!referenceDriver) return [];

    const races = referenceDriver.history.map(h => ({
      meeting_name: h.meeting_name,
      meeting_key: h.meeting_key,
      date: h.date
    }));

    // 2. Build the dataset
    return races.map((race) => {
      const point: any = {
        name: race.meeting_name,
      };

      data.forEach((driver: DriverSeasonStats) => { // Displaying all drivers might change to top 10
        const raceResult = driver.history.find((h: any) => h.meeting_key === race.meeting_key);
        if (raceResult) {
            // driver.driver_info?.name_acronym ||
          const key = driver.driver_info?.name_acronym || `Driver ${driver.driver_number}`;
          point[key] = raceResult.cumulative_points;
        }
      });

      return point;
    });
  }, [data]);

  // Generate lines for top 10 drivers to avoid clutter
  const topDrivers = data.slice(0, nToShow);

  return (
    <Card className="w-full h-[500px] mb-8">
        <CardHeader>
            <CardTitle>Drivers' Championship Points Progression</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                data={chartData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                <YAxis />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: 'black' }}
                 />
                <Legend />
                {topDrivers.map((driver) => (
                    <Line
                    key={driver.driver_number}
                    type="natural"
                    dataKey={driver.driver_info?.name_acronym || `Driver ${driver.driver_number}`}
                    // Use team colour if available, otherwise random or default
                    stroke={driver.driver_info?.team_colour ? `#${driver.driver_info.team_colour}` : '#8884d8'}
                    strokeWidth={2}
                    dot={{ r: 1 }}
                    activeDot={{ r: 3 }}
                    connectNulls

                    />
                ))}
                </LineChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
  );
}
