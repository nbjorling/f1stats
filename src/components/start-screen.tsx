'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  CalendarDays,
  Trophy,
  Disc3,
  GitGraph,
  LineChart,
} from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function StartScreen() {
  const menuItems = [
    {
      id: 'team-battles',
      title: 'Battles',
      description: 'Driver vs driver battles.',
      icon: Trophy,
      color: 'from-cyan-500/20 to-blue-500/20',
      hoverColor: 'group-hover:from-cyan-500/30 group-hover:to-blue-500/30',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'season-stats',
      title: 'Season Statistics',
      description: 'Driver standings, constructor points, and race results.',
      icon: LineChart,
      color: 'from-amber-500/20 to-orange-500/20',
      hoverColor: 'group-hover:from-amber-500/30 group-hover:to-orange-500/30',
      iconColor: 'text-amber-400',
    },
    {
      id: 'calendar',
      title: 'Race Calendar',
      description: 'Upcoming races, circuit info, and weekend schedules.',
      icon: CalendarDays,
      color: 'from-emerald-500/20 to-green-500/20',
      hoverColor: 'group-hover:from-emerald-500/30 group-hover:to-green-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      id: 'tyres',
      title: 'Tyre Strategy',
      description: 'Compound selection and tyre strategy insights per track.',
      icon: Disc3,
      color: 'from-purple-500/20 to-pink-500/20',
      hoverColor: 'group-hover:from-purple-500/30 group-hover:to-pink-500/30',
      iconColor: 'text-purple-400',
    },
    {
      id: 'live',
      title: 'Live Track Statistics',
      description: 'Real-time telemetry, track position, and sector times.',
      icon: Activity,
      color: 'from-blue-500/20 to-cyan-500/20',
      hoverColor: 'group-hover:from-blue-500/30 group-hover:to-cyan-500/30',
      iconColor: 'text-cyan-400',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-6 text-white selection:bg-white/20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[50%] -left-[20%] h-[1000px] w-[1000px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute top-[20%] -right-[20%] h-[800px] w-[800px] rounded-full bg-rose-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto max-w-5xl py-10"
      >
        <div className="mb-16 text-center">
          <motion.h1
            className="text-6xl font-black tracking-tighter sm:text-8xl"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <span className="text-red-600">F1 </span>
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              STATS
            </span>{' '}
          </motion.h1>
          <p className="mt-6 text-lg text-zinc-400 sm:text-xl font-light tracking-wide">
            Advanced telemetry and season insights for Formula 1
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <Link href={item.id}>
                <Card
                  className={cn(
                    'relative h-full overflow-hidden border-zinc-800 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500',
                    'hover:-translate-y-2 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/50',
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                      item.color,
                    )}
                  />

                  <div className="relative z-10 flex h-full flex-col py-4 px-6 md:p-8">
                    <div className="flex items-center gap-4 md:flex-col md:items-start mb-0">
                      <div
                        className={cn(
                          'flex h-14 w-14 items-center shrink-0 justify-center rounded-2xl bg-zinc-800/80 transition-transform duration-500 group-hover:scale-110 group-hover:bg-zinc-900',
                          item.iconColor,
                        )}
                      >
                        <item.icon className="h-7 w-7" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="md:mb-3 text-2xl font-bold tracking-tight text-zinc-100">
                          {item.title}
                        </h3>

                        <p className="text-zinc-400 group-hover:text-zinc-300">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex mt-auto pt-8 items-center text-sm font-medium text-zinc-500 transition-colors group-hover:text-white">
                      <span>Enter Dashboard</span>
                      <svg
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
