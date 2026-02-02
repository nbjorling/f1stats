// Export all track data
import { monaco, monza, spa, silverstone, suzuka, interlagos } from "./data";
import {
  bahrain,
  jeddah,
  albertPark,
  shanghai,
  miami,
  imola,
  barcelona,
  montreal,
  redBullRing,
  hungaroring,
  zandvoort,
} from "./data-extended";
import {
  baku,
  marinaBay,
  cota,
  mexico,
  lasVegas,
  lusail,
  yasMarina,
} from "./data-remaining";
import { TrackData } from "./types";

// All tracks in calendar order for 2025
export const allTracks: TrackData[] = [
  albertPark,     // Round 1 - Australia
  shanghai,       // Round 2 - China
  suzuka,         // Round 3 - Japan
  bahrain,        // Round 4 - Bahrain
  jeddah,         // Round 5 - Saudi Arabia
  miami,          // Round 6 - Miami
  imola,          // Round 7 - Emilia Romagna
  monaco,         // Round 8 - Monaco
  barcelona,      // Round 9 - Spain
  montreal,       // Round 10 - Canada
  redBullRing,    // Round 11 - Austria
  silverstone,    // Round 12 - Britain
  spa,            // Round 13 - Belgium
  hungaroring,    // Round 14 - Hungary
  zandvoort,      // Round 15 - Netherlands
  monza,          // Round 16 - Italy
  baku,           // Round 17 - Azerbaijan
  marinaBay,      // Round 18 - Singapore
  cota,           // Round 19 - USA
  mexico,         // Round 20 - Mexico
  interlagos,     // Round 21 - Brazil
  lasVegas,       // Round 22 - Las Vegas
  lusail,         // Round 23 - Qatar
  yasMarina,      // Round 24 - Abu Dhabi
];

// Track lookup by ID
export const trackMap = new Map<string, TrackData>(
  allTracks.map((track) => [track.id, track])
);

// Get track by ID
export function getTrackById(id: string): TrackData | undefined {
  return trackMap.get(id);
}

// Export individual tracks
export {
  monaco,
  monza,
  spa,
  silverstone,
  suzuka,
  interlagos,
  bahrain,
  jeddah,
  albertPark,
  shanghai,
  miami,
  imola,
  barcelona,
  montreal,
  redBullRing,
  hungaroring,
  zandvoort,
  baku,
  marinaBay,
  cota,
  mexico,
  lasVegas,
  lusail,
  yasMarina,
};

export * from "./types";
