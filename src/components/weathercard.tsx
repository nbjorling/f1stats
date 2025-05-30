import { Card, CardContent } from './ui/card';
import {
  IconCapsuleHorizontal,
  IconClock,
  IconCloudRain,
  IconDropletPin,
  IconRoad,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react';

export default function WeatherCard({
  weather,
}: {
  weather: {
    air_temperature: number;
    track_temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    wind_direction: number;
    rainfall: number;
    date: string;
  };
}) {
  const {
    air_temperature,
    track_temperature,
    humidity,
    pressure,
    wind_speed,
    wind_direction,
    rainfall,
    date,
  } = weather;

  return (
    <Card>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs xl:grid-cols-6">
          <div>
            <IconClock className="inline mr-1" />
            <strong>Time:</strong> {new Date(date).toLocaleTimeString('sv-SE')}
          </div>
          <div>
            <IconTemperature className="inline text-yellow-500 mr-1" />
            <strong>Air Temp:</strong> {air_temperature}°C
          </div>
          <div>
            <IconRoad className="inline text-red-500 mr-1" />
            <strong>Track Temp:</strong> {track_temperature}°C
          </div>
          <div>
            <IconCloudRain className="inline text-blue-500 mr-1" />
            <strong>Rainfall:</strong> {rainfall} mm
          </div>
          <div>
            <IconWind className="inline text-green-500 mr-1" />
            <strong>Wind:</strong> {wind_speed} m/s @ {wind_direction}°
          </div>
          <div>
            <IconDropletPin className="inline text-blue-500 mr-1" />
            <strong>Humidity:</strong> {humidity}%
          </div>
          <div>
            <IconCapsuleHorizontal className="inline text-gray-500 mr-1" />
            <strong>Pressure:</strong> {pressure} hPa
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
