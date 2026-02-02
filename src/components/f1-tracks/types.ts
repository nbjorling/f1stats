export interface TrackData {
  id: string;
  name: string;
  country: string;
  path: string; // SVG path data for track layout
  viewBox: string; // SVG viewBox
  pitExitPosition?: number; // @deprecated - use pit.exitT instead. 0-1 normalized position on track
  trackLength: number; // in meters (for reference)

  // Track sections configuration for multi-colored rendering
  sections?: TrackSections;

  // Legacy sector configuration (kept for compatibility)
  sectors?: TrackSectors;

  pit: PitLaneData;
}

export interface TrackPosition {
  x: number;
  y: number;
  rotation: number; // angle in degrees for driver marker orientation
}

export type TrackSectors = {
  // Legacy: fractions of lap length for sectors
  s1End: number; // e.g. 0.33
  s2End: number; // e.g. 0.66
};

export type TrackSections = {
  // Three sections with individual colors and boundaries (0-1 normalized)
  section1: {
    start: number; // typically 0
    end: number; // e.g. 0.33
    color: string; // e.g. "#FF1744"
  };
  section2: {
    start: number; // e.g. 0.33
    end: number; // e.g. 0.66
    color: string; // e.g. "#00E676"
  };
  section3: {
    start: number; // e.g. 0.66
    end: number; // typically 1.0
    color: string; // e.g. "#2979FF"
  };
};

export type PitLaneData = {
  // Fraction along the main track where pit lane entry starts (0-1)
  // Typically before the start/finish line (e.g., 0.92 for 92% around the lap)
  entryT: number;

  // Fraction along the main track where pit lane exit rejoins (0-1)
  // Typically after the start/finish line (e.g., 0.08 for 8% into the lap)
  exitT: number;

  // Optional: where the pit box/stop marker is along the main track (0-1)
  // Typically between entry and exit (accounting for track wrapping)
  boxT?: number;

  // Optional: explicit point marker instead of fraction
  boxPoint?: TrackPoint;
};

export type TrackPoint = { x: number; y: number; rotation?: number };
