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
        <table className="table-auto text-xs w-full">
          <tbody>
            <tr>
              <td className="py-2">
                <IconClock className="inline mr-2" />
                <strong>Time</strong>
              </td>
              <td className="text-lg">
                {new Date(date).toLocaleTimeString('sv-SE')}
              </td>
            </tr>
            <tr>
              <td className="py-2">
                <IconTemperature className="inline text-yellow-500 mr-2" />
                <strong>Air Temp</strong>
              </td>
              <td className="text-lg">{air_temperature}°C</td>
            </tr>
            <tr>
              <td className="py-2">
                <IconRoad className="inline text-red-500 mr-2" />
                <strong>Track Temp</strong>
              </td>
              <td className="text-lg">{track_temperature}°C</td>
            </tr>
            <tr>
              <td className="py-2">
                <IconCloudRain className="inline text-blue-500 mr-2" />
                <strong>Rainfall</strong>
              </td>
              <td className="text-lg">{rainfall} mm</td>
            </tr>
            <tr>
              <td className="py-2">
                <IconWind className="inline text-green-500 mr-2" />
                <strong>Wind</strong>
              </td>
              <td className="text-lg">
                {wind_speed} m/s @ {wind_direction}°
              </td>
            </tr>
            <tr>
              <td className="py-2">
                <IconDropletPin className="inline text-blue-500 mr-2" />
                <strong>Humidity</strong>
              </td>
              <td className="text-lg">{humidity}%</td>
            </tr>
            <tr>
              <td className="py-2">
                <IconCapsuleHorizontal className="inline text-gray-500 mr-2" />
                <strong>Pressure</strong>
              </td>
              <td className="text-lg">{pressure} hPa</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
