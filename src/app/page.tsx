import { StartScreen } from '@/components/start-screen';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <StartScreen onSelectView={() => {}} />
    </main>
  );
}
