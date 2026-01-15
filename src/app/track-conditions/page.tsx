'use client';
import { useEffect, useState } from 'react';
import WeatherCard from '../../components/weathercard';
import { Slider } from '../../components/ui/slider';
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../components/ui/card';
// const weather = {
//   air_temperature: 25,
//   track_temperature: 30,
//   humidity: 60,
//   pressure: 1013,
//   wind_speed: 5,
//   wind_direction: 180,
//   rainfall: 0,
//   date: '2025-05-01T14:00:00Z',
// };


interface Weather {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  rainfall: number;
  date: string;
}

export default function PitStops() {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<Weather[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSliderChange = (value: any) => {
    setSelectedIndex(value[0]);
  };
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

        const weatherRes = await fetch(
          `https://api.openf1.org/v1/weather?session_key=${session_key}`
        );

        weatherRes.json().then((data) => {
          setWeatherData(data);
        });
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

  const selected = weatherData && weatherData[selectedIndex];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold my-4">Racetrack</h1>

      {!weatherData || loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="w-full flex justify-between">
            <div>
              {new Date(weatherData[0].date).toLocaleTimeString('sv-SE')}
            </div>
            <div>
              {new Date(
                weatherData[weatherData.length - 1].date
              ).toLocaleTimeString('sv-SE')}
            </div>
          </div>
          <Slider
            min={0}
            max={weatherData.length - 1}
            step={1}
            value={[selectedIndex]}
            onValueChange={handleSliderChange}
            className="mb-4"
          />

          {selected && <WeatherCard weather={selected} />}

          <Card className="mt-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherData}>
                  {/* <XAxis dataKey="time" /> */}
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line
                    dot={false}
                    strokeWidth={2}
                    type="basisOpen"
                    dataKey="air_temperature"
                    stroke="yellow"
                    activeDot={{ r: 8 }}
                    name="Air Temp (°C)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
