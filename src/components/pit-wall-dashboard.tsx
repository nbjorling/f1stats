'use client';

import React, { useState, useMemo } from 'react';
import { useLiveTelemetry } from '@/hooks/use-live-telemetry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import TrackVisualization from '@/components/track-visualization';
import { allTracks, getTrackById } from '@/components/f1-tracks';
import { Activity, Radio, Cpu, Timer } from 'lucide-react';

const LAP_TIME = 90;
const MEDIAN_PIT_TIME = 20;

const locationToTrackId: Record<string, string> = {
  Sakhir: 'bahrain',
  Bahrain: 'bahrain',
  Melbourne: 'albert-park',
  Shanghai: 'shanghai',
  Suzuka: 'suzuka',
  'Miami Gardens': 'miami',
  Imola: 'imola',
  'Monte Carlo': 'monaco',
  Barcelona: 'barcelona',
  Montreal: 'montreal',
  Spielberg: 'red-bull-ring',
  Silverstone: 'silverstone',
  Budapest: 'hungaroring',
  'Spa-Francorchamps': 'spa',
  Zandvoort: 'zandvoort',
  Monza: 'monza',
  Baku: 'baku',
  Singapore: 'marina-bay',
  Austin: 'cota',
  'Mexico City': 'mexico',
  'São Paulo': 'interlagos',
  'Las Vegas': 'las-vegas',
  Lusail: 'lusail',
  'Abu Dhabi': 'yas-marina',
};

export default function PitWallDashboard() {
  const { session, drivers, isLoading, error, sessionTimeRemaining } =
    useLiveTelemetry();
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

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
    if (!session) return allTracks[0];
    const trackId =
      locationToTrackId[session.location] ||
      locationToTrackId[session.circuit_short_name];
    return getTrackById(trackId || '') || allTracks[0];
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="h-12 w-12 text-red-600 animate-pulse" />
          <p className="text-zinc-400 font-mono tracking-widest text-sm uppercase">
            Establishing Satellite Link...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <Activity className="h-12 w-12 text-red-950" />
          <div className="space-y-2">
            <p className="text-zinc-400 font-mono tracking-widest text-sm uppercase">
              Connection Failed
            </p>
            <p className="text-zinc-600 text-xs font-mono uppercase">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors rounded"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex-1">
        <Card className="bg-zinc-900/50 backdrop-blur-2xl border-zinc-800 overflow-hidden shadow-2xl ring-1 ring-white/5">
          <CardHeader className="space-y-4 border-b border-zinc-800 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10 text-red-500">
                  <Radio className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">
                    Pit Wall <span className="text-red-600">Master</span>
                  </CardTitle>
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest leading-none">
                    {session?.session_name} • {session?.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="outline"
                  className="bg-red-950/20 text-red-500 border-red-500/20 animate-pulse font-mono text-[10px] py-0 px-2 uppercase tracking-widest"
                >
                  Live Feed
                </Badge>
                {sessionTimeRemaining && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 rounded border border-zinc-800 shadow-inner">
                    <Timer className="h-3 w-3 text-red-600" />
                    <span className="font-mono text-[14px] font-black tabular-nums text-white">
                      {sessionTimeRemaining}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]">
            <div className="p-8">
              <TrackVisualization
                track={currentTrack}
                drivers={drivers}
                selectedDriverId={selectedDriverId}
                onDriverClick={(id) =>
                  setSelectedDriverId(id === selectedDriverId ? null : id)
                }
                pitExitPosition={pitExitPosition}
              />
            </div>

            {/* Telemetry Overlay */}
            <div className="absolute bottom-4 left-6 flex gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Track Status
                </span>
                <span className="text-green-500 font-mono text-sm font-black">
                  GREEN
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Air Temp
                </span>
                <span className="text-white font-mono text-sm">26.4°C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  Grip Level
                </span>
                <span className="text-white font-mono text-sm">OPTIMAL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-96 space-y-4">
        <Card className="bg-zinc-900/50 backdrop-blur-2xl border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="bg-zinc-800/30 border-b border-zinc-800 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                <Timer className="h-3 w-3" />
                Race Interval
              </CardTitle>
              <span className="text-[10px] font-mono text-zinc-600">
                UDP Port 20777
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {drivers
              .sort(
                (a, b) =>
                  b.lap - a.lap || b.positionOnTrack - a.positionOnTrack,
              )
              .map((d, idx) => (
                <div
                  key={d.driver}
                  onClick={() =>
                    setSelectedDriverId(
                      d.driver === selectedDriverId ? null : d.driver,
                    )
                  }
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-300',
                    selectedDriverId === d.driver ?
                      'bg-white/5 ring-1 ring-white/10 shadow-lg'
                    : 'hover:bg-white/5 border border-transparent',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500 w-4">
                          #{idx + 1}
                        </span>
                        <span className="font-black text-xs tracking-tight">
                          {d.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        Lap {d.lap}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-[11px] font-mono font-bold tabular-nums',
                        idx === 0 ? 'text-amber-500' : 'text-zinc-400',
                      )}
                    >
                      {idx === 0 ? 'INTERVAL' : `+${d.gapToLeader.toFixed(3)}s`}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {selectedDriver && (
          <Card className="bg-blue-600/5 border-blue-500/20 backdrop-blur-3xl animate-in fade-in slide-in-from-right-4 ring-1 ring-blue-500/10">
            <CardHeader className="pb-2 border-b border-blue-500/10">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center justify-between">
                Driver Telemetry #{selectedDriver.driver}
                <Badge
                  variant="outline"
                  className="text-[8px] uppercase tracking-tighter text-blue-400 border-blue-400/20"
                >
                  Encrypted
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-[8px] text-zinc-500 uppercase block mb-1">
                    Track Progress
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-blue-400">
                      {(selectedDriver.positionOnTrack * 100).toFixed(1)}%
                    </span>
                    <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${selectedDriver.positionOnTrack * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-[8px] text-zinc-500 uppercase block mb-1">
                    Status
                  </span>
                  <span className="text-sm font-mono font-bold text-green-500 uppercase tracking-tighter">
                    {selectedDriver.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-red-600/5 rounded-lg border border-red-500/10">
                <span className="text-[8px] text-red-400 uppercase font-black block mb-2 tracking-widest">
                  Strategic Pit Analysis
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                  Calculated exit position:{' '}
                  <span className="text-white">
                    {(pitExitPosition! * 100).toFixed(1)}%
                  </span>
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 italic">
                  Clean air window ahead of Williams #
                  {selectedDriver.driver + 1}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
