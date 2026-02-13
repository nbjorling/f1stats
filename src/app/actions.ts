'use server';

import { openF1Client } from '@/lib/api-client';
import {
  getLatestSession,
  getDrivers,
  getEnrichedDrivers,
  getTelemetry,
  getSessionLaps,
  getSessionStints,
  getSessionPit,
} from '@/lib/openf1';

import {
  Session,
  Driver,
  Lap,
  TelemetryLocation,
  TyreStint,
} from '@/lib/types';

export async function fetchLiveSession(): Promise<Session | null> {
  return await getLatestSession();
}

export async function fetchSessionDrivers(
  sessionKey: number,
): Promise<Driver[]> {
  return await getEnrichedDrivers(sessionKey);
}

export async function fetchLiveLapData(sessionKey: number): Promise<Lap[]> {
  return await getSessionLaps(sessionKey);
}

export async function fetchLiveTyreData(
  sessionKey: number,
): Promise<TyreStint[]> {
  return await getSessionStints(sessionKey);
}

export async function fetchLivePitData(sessionKey: number): Promise<any[]> {
  return await getSessionPit(sessionKey);
}

export async function fetchDriverTelemetry(
  sessionKey: number,
  driverNumber: number,
  startTime?: string,
): Promise<TelemetryLocation[]> {
  return await getTelemetry(sessionKey, driverNumber, startTime);
}

export async function fetchMqttToken(): Promise<string | null> {
  return await openF1Client.getAccessToken();
}
