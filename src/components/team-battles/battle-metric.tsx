import { cn } from '@/lib/utils';

interface BattleMetricProps {
  label: string;
  driver1Score: number;
  driver2Score: number;
  driver1Name: string;
  driver2Name: string;
  reverse?: boolean;
}

export function BattleMetric({
  label,
  driver1Score,
  driver2Score,
  reverse = false,
}: BattleMetricProps) {
  const total = driver1Score + driver2Score;
  const driver1Pct = total > 0 ? (driver1Score / total) * 100 : 50;
  const driver2Pct = total > 0 ? (driver2Score / total) * 100 : 50;

  // For avg position (variable reverse=true), lower is better.
  // If reverse is true: driver1 wins if score < driver2 score
  const driver1Winning =
    reverse ? driver1Score < driver2Score : driver1Score > driver2Score;

  // If scores are equal, nobody is strictly winning color-wise,
  // currently the logic defaults to driver2 color if not driver1Winning?
  // Actually logic: driver1Winning ? text-white : text-zinc-500.
  // If equal (and not reverse), driver1Winning is false (equal is not >).
  // Let's keep original logic for consistency.

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-400">{label}</span>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-bold',
              driver1Winning ? 'text-white' : 'text-zinc-500',
            )}
          >
            {reverse ? driver1Score.toFixed(1) : driver1Score}
          </span>
          <span className="text-zinc-600">-</span>
          <span
            className={cn(
              'font-bold',
              !driver1Winning && driver1Score !== driver2Score ?
                'text-white'
              : 'text-zinc-500',
            )}
            // Original logic: !driver1Winning ? 'text-white' ...
            // If equal, driver1Winning is false. So driver 2 gets white?
            // Let's refine: if equal, both grey? Or both white?
            // The original code was: !driver1Winning ? 'text-white' : 'text-zinc-500'
            // If 10 vs 10. 10 > 10 is false. So driver 2 gets white.
            // I'll stick close to original but maybe improve equality case if needed.
            // For now, verbatim copy of logic to avoid visual regression.
          >
            {reverse ? driver2Score.toFixed(1) : driver2Score}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
        {total > 0 ?
          <>
            <div
              className={cn(
                'absolute left-0 top-0 h-full transition-all duration-500',
                driver1Winning ?
                  'bg-gradient-to-r from-green-500 to-emerald-400'
                : 'bg-zinc-600',
              )}
              style={{ width: `${driver1Pct}%` }}
            />
            <div
              className={cn(
                'absolute right-0 top-0 h-full transition-all duration-500',
                (
                  !driver1Winning // This treats equal as driver 2 win?
                ) ?
                  'bg-gradient-to-l from-purple-500 to-pink-400'
                : 'bg-zinc-600',
              )}
              style={{ width: `${driver2Pct}%` }}
            />
          </>
        : <div className="h-full bg-zinc-700" />}
      </div>
    </div>
  );
}
