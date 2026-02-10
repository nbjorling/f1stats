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
import { ChartContainer } from '../ui/chart';

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
    const referenceDriver = data.find((d) => d.history.length > 0);
    if (!referenceDriver) return [];

    const races = referenceDriver.history.map((h) => ({
      meeting_name: h.meeting_name,
      meeting_key: h.meeting_key,
      date: h.date,
    }));

    // 2. Build the dataset
    return races.map((race) => {
      const point: any = {
        name: race.meeting_name,
      };

      data.forEach((driver: DriverSeasonStats) => {
        // Displaying all drivers might change to top 10
        const raceResult = driver.history.find(
          (h: any) => h.meeting_key === race.meeting_key,
        );
        if (raceResult) {
          // driver.driver_info?.name_acronym ||
          const key =
            driver.driver_info?.name_acronym ||
            `Driver ${driver.driver_number}`;
          point[key] = raceResult.cumulative_points;
        }
      });

      return point;
    });
  }, [data]);

  // Generate lines for top 10 drivers to avoid clutter
  const topDrivers = data.slice(0, nToShow);

  const chartConfig = {
    views: {
      label: 'Page Views',
    },
    desktop: {
      label: 'Desktop',
      color: 'var(--chart-1)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--chart-2)',
    },
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle>Drivers' Championship Points Progression</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            {/* <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            /> */}
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                background: 'black',
              }}
            />
            <Legend verticalAlign="top" height={36} />
            {topDrivers.map((driver) => (
              <Line
                key={driver.driver_number}
                type="monotone"
                strokeWidth={2}
                dot={false}
                dataKey={
                  driver.driver_info?.name_acronym ||
                  `Driver ${driver.driver_number}`
                }
                // Use team colour if available, otherwise random or default
                stroke={
                  driver.driver_info?.team_colour ?
                    `#${driver.driver_info.team_colour}`
                  : '#8884d8'
                }
                activeDot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
