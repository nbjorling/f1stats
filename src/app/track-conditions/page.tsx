'use client';
import { useEffect, useState } from 'react';
import WeatherCard from '../../components/weathercard';

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

export default function PitStops() {
  const [loading, setLoading] = useState(true);
  console.log('Koca: loading ', loading);

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
        console.log('Koca: session_key ', session_key);

        // const weatherRes = await fetch(
        //   `https://api.openf1.org/v1/weather?session_key=${session_key}`
        // );

        // const weatherData = await weatherRes.json();
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
    </div>
  );
}
