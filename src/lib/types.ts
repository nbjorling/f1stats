export interface Driver {
  broadcast_name: string;
  country_code: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string;
  last_name: string;
  meeting_key: number;
  name_acronym: string;
  session_key: number;
  team_colour: string;
  team_name: string;
}

export interface Session {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_end: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  session_key: number;
  session_name: string;
  session_type: string;
  year: number;
}

export interface Position {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface SessionResult {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  position: number;
  points: number;
  grid_position?: number;
  status?: number;
  is_pit_stop?: boolean;
  name_acronym?: string;
  team_colour?: string;
  time?: string; // For quali/practice best lap
  gap_to_leader?: string; // For race
}

export interface DriverStanding {
  driver_number: number;
  meeting_key: number;
  points_current: number; // Note: API docs say points_current? Verification needed, assuming number based on usage
  points_start?: number; // Optional as it might not be in all responses
  position_current: number;
  position_start?: number;
  session_key: number;
}

export interface RacePoints {
  meeting_key: number;
  session_key: number;
  meeting_name: string;
  date: string;
  points: number;
  position: number;
  cumulative_points: number;
  is_classified?: boolean;
  status?: number;
}

export interface QualifyingResult {
  meeting_key: number;
  session_key: number;
  position: number;
  date: string;
}

export interface DriverSeasonStats {
  driver_number: number;
  driver_info?: Driver;
  history: RacePoints[];
  qualifying_history: QualifyingResult[];
  total_points: number;
}

export interface TyreStint {
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';
  driver_number: number;
  lap_end: number;
  lap_start: number;
  meeting_key: number;
  session_key: number;
  stint_number: number;
  tyre_age_at_start: number;
}

export interface TrackTyreInfo {
  meeting_key: number;
  meeting_name: string;
  location: string;
  country_code: string;
  date_start: string;
  date_end: string;
  compounds: string[];
  race_session_key?: number;
}

export interface TeammateBattle {
  team_name: string;
  team_colour: string;
  driver1: Driver;
  driver2: Driver;
  quali_battle: { driver1_wins: number; driver2_wins: number };
  race_pace: { driver1_avg: number; driver2_avg: number };
  points: { driver1_points: number; driver2_points: number };
  consistency: {
    driver1_dnfs: number;
    driver2_dnfs: number;
    total_races: number;
  };
  head_to_head: { driver1_ahead: number; driver2_ahead: number };
  fastest_laps: { driver1_count: number; driver2_count: number };
}

export interface Lap {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
}

export interface TelemetryLocation {
  date: string;
  session_key: number;
  meeting_key: number;
  driver_number: number;
  x: number;
  y: number;
  z: number;
}
