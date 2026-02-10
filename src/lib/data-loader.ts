import fs from 'fs/promises';
import path from 'path';
import {
  Driver,
  DriverSeasonStats,
  Session,
  SessionResult,
  TyreStint,
  TeammateBattle,
} from './types';

// Base paths
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');

// Helper to safely read JSON
async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// --- Raw Data Access ---

export async function getSeasonSchedule(year: number): Promise<Session[]> {
  // The raw season file contains weekends with sessions inside
  // Structure: { meeting_key, sessions: Session[], ... }[]
  // We need to flatten this to return Session[] to match expected API

  type RaceWeekend = {
    meeting_key: number;
    sessions: Session[];
    results?: Record<string, SessionResult[]>;
  };

  const filePath = path.join(RAW_DIR, 'seasons', `${year}.json`);
  const weekends = await readJson<RaceWeekend[]>(filePath);

  if (!weekends) return [];

  return weekends
    .flatMap((w) => w.sessions)
    .sort(
      (a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
    );
}

export async function getSeasonDriversRaw(year: number): Promise<Driver[]> {
  const filePath = path.join(RAW_DIR, 'drivers', `${year}.json`);
  const drivers = await readJson<Driver[]>(filePath);
  return drivers || [];
}

// --- Processed Data Access ---

export async function getDriverStandingsRaw(
  year: number,
): Promise<DriverSeasonStats[]> {
  const filePath = path.join(PROCESSED_DIR, 'standings', `${year}.json`);
  const standings = await readJson<DriverSeasonStats[]>(filePath);
  return standings || [];
}

export async function getTeamBattlesRaw(
  year: number,
): Promise<TeammateBattle[]> {
  const filePath = path.join(PROCESSED_DIR, 'team-battles', `${year}.json`);
  const battles = await readJson<TeammateBattle[]>(filePath);
  return battles || [];
}

export async function getTyreStatsRaw(year: number): Promise<any> {
  const filePath = path.join(PROCESSED_DIR, 'tyres', `${year}.json`);
  return await readJson(filePath);
}

// --- List Available Data ---

export async function getAvailableSeasons(): Promise<number[]> {
  try {
    const seasonsDir = path.join(RAW_DIR, 'seasons');
    const files = await fs.readdir(seasonsDir);
    return files
      .filter((f) => f.endsWith('.json'))
      .map((f) => parseInt(f.replace('.json', '')))
      .sort((a, b) => b - a);
  } catch (e) {
    return [];
  }
}
