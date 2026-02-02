import TrackDashboard from "@/components/track-dashboard";

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-white/10 selection:text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black italic tracking-tighter sm:text-6xl mb-4 uppercase">
            Live Track <span className="text-f1-red text-red-600">Dynamics</span>
          </h1>
          <p className="text-neutral-500 max-w-2xl mx-auto">
            Real-time driver positioning, gap analysis, and strategic pit entry prediction for professional race engineering.
          </p>
        </div>

        <TrackDashboard />
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>
    </main>
  );
}
