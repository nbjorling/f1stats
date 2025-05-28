'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { Skeleton } from '@/components/ui/skeleton';
// import { ScrollArea } from '@/components/ui/scroll-area';
import WeatherCard from '@/components/weathercard';
import Image from 'next/image';

const weather = {
  air_temperature: 25,
  track_temperature: 30,
  humidity: 60,
  pressure: 1013,
  wind_speed: 5,
  wind_direction: 180,
  rainfall: 0,
  date: '2025-05-01T14:00:00Z',
};

const driverData = [
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 1,
    broadcast_name: 'M VERSTAPPEN',
    full_name: 'Max VERSTAPPEN',
    name_acronym: 'VER',
    team_name: 'Red Bull Racing',
    team_colour: '3671C6',
    first_name: 'Max',
    last_name: 'Verstappen',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 4,
    broadcast_name: 'L NORRIS',
    full_name: 'Lando NORRIS',
    name_acronym: 'NOR',
    team_name: 'McLaren',
    team_colour: 'FF8000',
    first_name: 'Lando',
    last_name: 'Norris',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 5,
    broadcast_name: 'G BORTOLETO',
    full_name: 'Gabriel BORTOLETO',
    name_acronym: 'BOR',
    team_name: 'Kick Sauber',
    team_colour: '52E252',
    first_name: 'Gabriel',
    last_name: 'Bortoleto',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 6,
    broadcast_name: 'I HADJAR',
    full_name: 'Isack HADJAR',
    name_acronym: 'HAD',
    team_name: 'Racing Bulls',
    team_colour: '6692FF',
    first_name: 'Isack',
    last_name: 'Hadjar',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 10,
    broadcast_name: 'P GASLY',
    full_name: 'Pierre GASLY',
    name_acronym: 'GAS',
    team_name: 'Alpine',
    team_colour: '0093CC',
    first_name: 'Pierre',
    last_name: 'Gasly',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 12,
    broadcast_name: 'K ANTONELLI',
    full_name: 'Kimi ANTONELLI',
    name_acronym: 'ANT',
    team_name: 'Mercedes',
    team_colour: '27F4D2',
    first_name: 'Kimi',
    last_name: 'Antonelli',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea%20Kimi_Antonelli/andant01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 14,
    broadcast_name: 'F ALONSO',
    full_name: 'Fernando ALONSO',
    name_acronym: 'ALO',
    team_name: 'Aston Martin',
    team_colour: '229971',
    first_name: 'Fernando',
    last_name: 'Alonso',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 16,
    broadcast_name: 'C LECLERC',
    full_name: 'Charles LECLERC',
    name_acronym: 'LEC',
    team_name: 'Ferrari',
    team_colour: 'E80020',
    first_name: 'Charles',
    last_name: 'Leclerc',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 18,
    broadcast_name: 'L STROLL',
    full_name: 'Lance STROLL',
    name_acronym: 'STR',
    team_name: 'Aston Martin',
    team_colour: '229971',
    first_name: 'Lance',
    last_name: 'Stroll',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 22,
    broadcast_name: 'Y TSUNODA',
    full_name: 'Yuki TSUNODA',
    name_acronym: 'TSU',
    team_name: 'Red Bull Racing',
    team_colour: '3671C6',
    first_name: 'Yuki',
    last_name: 'Tsunoda',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 23,
    broadcast_name: 'A ALBON',
    full_name: 'Alexander ALBON',
    name_acronym: 'ALB',
    team_name: 'Williams',
    team_colour: '64C4FF',
    first_name: 'Alexander',
    last_name: 'Albon',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 27,
    broadcast_name: 'N HULKENBERG',
    full_name: 'Nico HULKENBERG',
    name_acronym: 'HUL',
    team_name: 'Kick Sauber',
    team_colour: '52E252',
    first_name: 'Nico',
    last_name: 'Hulkenberg',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 30,
    broadcast_name: 'L LAWSON',
    full_name: 'Liam LAWSON',
    name_acronym: 'LAW',
    team_name: 'Racing Bulls',
    team_colour: '6692FF',
    first_name: 'Liam',
    last_name: 'Lawson',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 31,
    broadcast_name: 'E OCON',
    full_name: 'Esteban OCON',
    name_acronym: 'OCO',
    team_name: 'Haas F1 Team',
    team_colour: 'B6BABD',
    first_name: 'Esteban',
    last_name: 'Ocon',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 43,
    broadcast_name: 'F COLAPINTO',
    full_name: 'Franco COLAPINTO',
    name_acronym: 'COL',
    team_name: 'Alpine',
    team_colour: '0093CC',
    first_name: 'Franco',
    last_name: 'Colapinto',
    headshot_url: null,
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 44,
    broadcast_name: 'L HAMILTON',
    full_name: 'Lewis HAMILTON',
    name_acronym: 'HAM',
    team_name: 'Ferrari',
    team_colour: 'E80020',
    first_name: 'Lewis',
    last_name: 'Hamilton',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 55,
    broadcast_name: 'C SAINZ',
    full_name: 'Carlos SAINZ',
    name_acronym: 'SAI',
    team_name: 'Williams',
    team_colour: '64C4FF',
    first_name: 'Carlos',
    last_name: 'Sainz',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 63,
    broadcast_name: 'G RUSSELL',
    full_name: 'George RUSSELL',
    name_acronym: 'RUS',
    team_name: 'Mercedes',
    team_colour: '27F4D2',
    first_name: 'George',
    last_name: 'Russell',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 81,
    broadcast_name: 'O PIASTRI',
    full_name: 'Oscar PIASTRI',
    name_acronym: 'PIA',
    team_name: 'McLaren',
    team_colour: 'FF8000',
    first_name: 'Oscar',
    last_name: 'Piastri',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png',
    country_code: null,
  },
  {
    meeting_key: 1260,
    session_key: 9982,
    driver_number: 87,
    broadcast_name: 'O BEARMAN',
    full_name: 'Oliver BEARMAN',
    name_acronym: 'BEA',
    team_name: 'Haas F1 Team',
    team_colour: 'B6BABD',
    first_name: 'Oliver',
    last_name: 'Bearman',
    headshot_url:
      'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png',
    country_code: null,
  },
];

type Pitstop = {
  date: string;
  driver_number: number;
  lap_number: number;
  meeting_key: number;
  pit_duration: number;
  session_key: number;
};

type Driver = {
  driver_number: number;
  first_name: string;
  last_name: string;
  team_colour: string;
  headshot_url?: string | null;
  team_name?: string;
  country_code?: string | null;
};

type PitStopFullData = Driver & { stops: Pitstop[] };

const getTextColor = (
  stopTime: number,
  quickestPitStop: number,
  slowestPitStop: number
) => {
  if (stopTime === quickestPitStop) {
    return 'text-purple-500';
  }
  if (stopTime > quickestPitStop && stopTime < quickestPitStop + 1) {
    return 'text-green-500';
  }

  if (stopTime === slowestPitStop) {
    return 'text-red-500';
  }

  return '';
};

export default function PitStops() {
  const [pitStops, setPitStops] = useState<PitStopFullData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickestPitStop, setQuickestPitStop] = useState<Pitstop | null>(null);
  const [slowestPitStop, setSlowestPitStop] = useState<Pitstop | null>(null);

  useEffect(() => {
    async function fetchPitStops() {
      setLoading(true);
      try {
        const sessionRes = await fetch(
          'https://api.openf1.org/v1/sessions?session_name=Race&year=2025'
        );
        const sessions = await sessionRes.json();
        if (sessions.length === 0) return;

        const { session_key } = sessions.at(-1);

        const pitStopsRes = await fetch(
          `https://api.openf1.org/v1/pit?session_key=${session_key}`
        );
        // const weatherRes = await fetch(
        //   `https://api.openf1.org/v1/weather?session_key=${session_key}`
        // );

        const pitStopsData: Pitstop[] = await pitStopsRes.json();

        // const weatherData = await weatherRes.json();

        const driverMap: Record<number, Pitstop[]> = {};

        pitStopsData.forEach((stop) => {
          if (stop.driver_number && !driverMap[stop.driver_number]) {
            driverMap[stop.driver_number] = [];
          }
          driverMap[stop.driver_number].push(stop);
        });

        setQuickestPitStop(
          pitStopsData.reduce((prev, current) => {
            return prev.pit_duration < current.pit_duration ? prev : current;
          })
        );

        setSlowestPitStop(
          pitStopsData.reduce((prev, current) => {
            return prev.pit_duration > current.pit_duration ? prev : current;
          })
        );

        const drivers = Object.entries(driverMap).map(
          ([driver_number, stops]) => {
            const thisDriver = driverData.find(
              (driverMap) => driverMap.driver_number === parseInt(driver_number)
            );

            if (!thisDriver) {
              throw new Error(`Driver with number ${driver_number} not found`);
            }

            return {
              driver_number: parseInt(driver_number),
              first_name: thisDriver.first_name,
              last_name: thisDriver.last_name,
              team_colour: thisDriver.team_colour,
              headshot_url: thisDriver.headshot_url,
              team_name: thisDriver.team_name,
              country_code: thisDriver.country_code,
              stops,
            };
          }
        );

        setPitStops(drivers);
      } catch (error) {
        console.error('Error fetching pit stops:', error);
      } finally {
        setLoading(false);
      }
    }

    // poll data every 10 seconds
    // const pollInterval = setInterval(async () => {
    //   fetchPitStops();
    // }, 10000 * 6);

    fetchPitStops();

    // return () => clearInterval(pollInterval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold my-4">Racetrack</h1>
      <WeatherCard weather={weather} />
      <h1 className="text-2xl font-bold my-4">F1 Pit Stop Stats</h1>
      {loading ? (
        <div className="">
          {/* {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))} */}
        </div>
      ) : (
        <div className="grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 grid gap-4">
          {pitStops.map((driver) => (
            <Card key={driver.driver_number}>
              <CardContent>
                <div className="flex gap-2">
                  {driver.headshot_url && (
                    <Image
                      src={driver.headshot_url}
                      alt={`${driver.first_name} ${driver.last_name}`}
                      className="w-12 h-12 rounded-full mr-4"
                      height={48}
                      width={48}
                    />
                  )}
                  <div className="mr-4 grow">
                    <span
                      className="text-xl font-semibold mr-2"
                      style={{ color: `#${driver.team_colour}` }}
                    >
                      {driver.first_name}
                    </span>
                    <h2 className="text-xl font-semibold">
                      {driver.last_name}
                    </h2>
                  </div>
                  <ul className="p-2 px-3 rounded-lg">
                    {driver.stops.map((stop, idx) => (
                      <li key={idx}>
                        Lap: {stop.lap_number} - Duration:{' '}
                        <span
                          className={getTextColor(
                            stop.pit_duration,
                            quickestPitStop?.pit_duration || 0,
                            slowestPitStop?.pit_duration || 0
                          )}
                        >
                          {stop.pit_duration}s
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
