'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { StartScreen } from '@/components/start-screen';
import { Button } from '@/components/ui/button';

import data from './data.json';

export default function Page() {
  const [currentView, setCurrentView] = useState<
    'start' | 'live-track' | 'season-stats' | 'calendar'
  >('start');

  const renderContent = () => {
    switch (currentView) {
      case 'live-track':
      case 'season-stats': // Combining these for now as per the "existing dashboard" logic
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-1 flex-col"
          >
            <div className="mb-4 flex items-center px-4 pt-4 lg:px-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('start')}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Start
              </Button>
            </div>
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 pb-4 md:gap-6 md:pb-6">
                <SectionCards />
                <div className="">
                  <ChartAreaInteractive />
                </div>
                <DataTable data={data} />
              </div>
            </div>
          </motion.div>
        );
      case 'calendar':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="flex min-h-screen flex-col items-center justify-center p-8 text-center"
          >
            <Button
              variant="ghost"
              onClick={() => setCurrentView('start')}
              className="absolute top-4 left-4 gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Start
            </Button>
            <h1 className="text-4xl font-bold mb-4">Race Calendar</h1>
            <p className="text-xl text-muted-foreground">Coming Soon</p>
          </motion.div>
        );
      case 'start':
      default:
        return <StartScreen onSelectView={setCurrentView} />;
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col">{renderContent()}</div>
    </>
  );
}
