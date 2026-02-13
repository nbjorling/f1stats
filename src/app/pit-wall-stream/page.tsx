import PitWallDashboardStream from '@/components/pit-wall-dashboard-stream';

export default function PitWallPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-red-500/30 selection:text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter sm:text-7xl mb-4 uppercase">
            Pit Wall <span className="text-red-600">Command</span>
          </h1>
          <p className="text-zinc-500 max-w-2xl mx-auto font-mono text-xs uppercase tracking-[0.2em]">
            Strategic multi-vector telemetry overview for professional race
            direction.
          </p>
        </div>

        <PitWallDashboardStream />
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>
    </main>
  );
}
