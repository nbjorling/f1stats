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
}

export interface DriverSeasonStats {
  driver_number: number;
  driver_info?: Driver;
  history: RacePoints[];
  total_points: number;
}
