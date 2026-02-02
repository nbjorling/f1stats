'use client';

import React, { useState, useMemo } from 'react';
import { useTrackData, DriverData } from '@/hooks/use-track-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TrackSelector from '@/components/track-selector';
import TrackVisualization from '@/components/track-visualization';
import { allTracks, getTrackById } from '@/components/f1-tracks';

const LAP_TIME = 90;
const MEDIAN_PIT_TIME = 20;

export default function TrackDashboard() {
  const drivers = useTrackData();
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('monaco');

  const selectedDriver = useMemo(
    () => drivers.find((d) => d.driver === selectedDriverId),
    [drivers, selectedDriverId],
  );

  const pitExitPosition = useMemo(() => {
    if (!selectedDriver) return null;
    let pos = selectedDriver.positionOnTrack - MEDIAN_PIT_TIME / LAP_TIME;
    while (pos < 0) pos += 1;
    return pos;
  }, [selectedDriver]);

  const currentTrack = useMemo(() => {
    return getTrackById(selectedTrackId) || allTracks[0];
  }, [selectedTrackId]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex-1">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Track Position Monitor
            </CardTitle>
            <TrackSelector
              selectedTrackId={selectedTrackId}
              onTrackChange={setSelectedTrackId}
            />
          </CardHeader>
          <CardContent className="flex justify-center items-center  bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]">
            <TrackVisualization
              track={currentTrack}
              drivers={drivers}
              selectedDriverId={selectedDriverId}
              onDriverClick={(id) =>
                setSelectedDriverId(id === selectedDriverId ? null : id)
              }
              pitExitPosition={pitExitPosition}
            />
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-80 space-y-4">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Live Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {drivers.map((d) => (
              <div
                key={d.driver}
                onClick={() =>
                  setSelectedDriverId(
                    d.driver === selectedDriverId ? null : d.driver,
                  )
                }
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                  selectedDriverId === d.driver ?
                    'bg-white/10 ring-1 ring-white/20'
                  : 'hover:bg-white/5',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="font-bold text-lg">
                    P{drivers.indexOf(d) + 1}
                  </span>
                  <span className="text-sm font-mono text-gray-300">
                    #{d.driver}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-gray-500 block">
                    GAP
                  </span>
                  <span className="text-sm font-mono">
                    {d.gapToLeader > 0 ?
                      '+' + d.gapToLeader.toFixed(3) + 's'
                    : 'LEADER'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedDriver && (
          <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-xl animate-in fade-in slide-in-from-right-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-300 flex items-center justify-between">
                Pit Strategy Tool
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider text-blue-400 border-blue-400/30"
                >
                  Predicted
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-blue-200/70 mb-4">
                Based on median pit loss of <strong>{MEDIAN_PIT_TIME}s</strong>,
                Driver <strong>#{selectedDriver.driver}</strong> would exit at
                the white marker.
              </div>

              {/* Traffic Analysis */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-blue-400/50">
                  Surrounding Traffic
                </div>
                {(() => {
                  // Find cars near the pit exit position
                  const nearby = drivers
                    .filter((d) => {
                      if (d.driver === selectedDriver.driver) return false;
                      let diff = d.positionOnTrack - pitExitPosition!;
                      if (diff > 0.5) diff -= 1;
                      if (diff < -0.5) diff += 1;
                      return Math.abs(diff) < 0.1; // Within 10% of track length
                    })
                    .sort((a, b) => b.positionOnTrack - a.positionOnTrack);

                  if (nearby.length === 0)
                    return (
                      <div className="text-xs italic text-green-400/60">
                        Clean air on exit
                      </div>
                    );

                  return nearby.map((d) => (
                    <div
                      key={d.driver}
                      className="flex items-center justify-between text-xs bg-black/20 p-2 rounded border border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: d.color }}
                        />
                        <span>Driver #{d.driver}</span>
                      </div>
                      <span
                        className={cn(
                          'font-mono font-bold',
                          d.positionOnTrack - pitExitPosition! > 0 ?
                            'text-red-400'
                          : 'text-green-400',
                        )}
                      >
                        {(
                          (d.positionOnTrack - pitExitPosition!) *
                          LAP_TIME
                        ).toFixed(1)}
                        s
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
