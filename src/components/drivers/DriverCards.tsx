import { Crown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { getCountryEmoji } from '@/utils/getCountryEmojii';
import { getCountryFullName } from '@/utils/getCountryFullName';
import { Driver } from '@/lib/types';

interface DriverCardsProps {
  drivers: Driver[];
}

export default function DriverCards({ drivers }: DriverCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {drivers.map((driver, index) => (
        <Card
          key={driver.driver_number + '-' + index}
          className="@container/card hover:shadow-lg transition-shadow duration-200"
        >
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm mt-1 font-semibold  flex items-center gap-2">
              {driver.team_name}
            </CardTitle>
            <CardAction>
              <div className="flex items-center gap-2">
                {index < 3 && (
                  <Crown
                    size={20}
                    className="drop-shadow-sm"
                    fill={
                      index === 0 ?
                        '#FFD700' // Gold
                      : index === 1 ?
                        '#C0C0C0' // Silver
                      : '#CD7F32' // Bronze
                    }
                    color={
                      index === 0 ?
                        '#B8860B' // Darker Gold Outline
                      : index === 1 ?
                        '#A9A9A9' // Darker Silver Outline
                      : '#8B4513' // Darker Bronze Outline
                    }
                  />
                )}
                <Badge
                  variant="outline"
                  className="outline"
                  style={{ outlineColor: `#${driver.team_colour}` }}
                >
                  #{driver.driver_number} · {driver.name_acronym}
                </Badge>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="text-xl font-semibold  flex items-center gap-2">
            <p className="flex flex-col grow">
              <span style={{ color: `#${driver.team_colour}` }}>
                {driver.first_name}
              </span>
              <span>{driver.last_name}</span>
              <span className="text-lg flex flex-row items-center mt-1">
                <span className="mr-2 text-2xl ">
                  {getCountryEmoji(driver.country_code)}
                </span>
                <span className="text-muted-foreground text-sm font-normal">
                  {getCountryFullName(driver.country_code)}
                </span>
              </span>
            </p>
            {driver.headshot_url && (
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 bg-muted"
                style={{ borderColor: `#${driver.team_colour}40` }}
              >
                <Image
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
