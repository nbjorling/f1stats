import driverData from './driverData.json';

type Driver = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string;
};

const getDrivers = () => {
  const uniqueDrivers = [] as Driver[];
  const sessions = new Set() as Set<number>;

  driverData.forEach((entry: Driver) => {
    sessions.add(entry.session_key);
    if (!uniqueDrivers.find((driver) => driver.full_name === entry.full_name))
      uniqueDrivers.push(entry);
  });

  const orderedSessions = [...sessions.values()].sort((a, b) =>
    a > b ? -1 : 0
  );
  return { uniqueDrivers, sessions: orderedSessions };
};

const getDriversFromSession = (session: number): Driver[] => {
  return [...driverData.filter((entry) => entry.session_key === session)];
};

export { getDrivers, getDriversFromSession };
