'use server';

import {
  getLatestSession,
  getLatestLapData,
  getDrivers,
  getTelemetry,
} from '@/lib/openf1';
import { Session, Driver, Lap, TelemetryLocation } from '@/lib/types';

export async function fetchLiveSession(): Promise<Session | null> {
  return await getLatestSession();
}

export async function fetchSessionDrivers(
  sessionKey: number,
): Promise<Driver[]> {
  return await getDrivers(sessionKey);
}

export async function fetchLiveLapData(sessionKey: number): Promise<Lap[]> {
  return await getLatestLapData(sessionKey);
}

export async function fetchDriverTelemetry(
  sessionKey: number,
  driverNumber: number,
  startTime?: string,
): Promise<TelemetryLocation[]> {
  return await getTelemetry(sessionKey, driverNumber, startTime);
}
