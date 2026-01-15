'use client';
import { Badge } from '../../components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import Image from 'next/image';
import { getCountryEmoji } from '../../utils/getCountryEmojii';
import { getCountryFullName } from '../../utils/getCountryFullName';
import { getDrivers, getDriversFromSession } from './driverStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { SidebarMenuButton } from '../../components/ui/sidebar';
import React, { useState } from 'react';
import { IconCaretDown } from '@tabler/icons-react';

export default function DriverCards() {
  const [session, setSession] = useState<number>(10033);

  const { sessions } = getDrivers();
  const drivers = getDriversFromSession(session);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border-accent border m-4 mb-0 w-auto">
            <span className="truncate font-medium">Choose Meeting</span>
            <IconCaretDown />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <div className="w-screen">
          <DropdownMenuContent
            className="rounded-lg bg-background p-4 grid-cols-5 grid"
            align="start"
            sideOffset={4}
          >
            {[...sessions?.values()].map((session) => {
              return (
                <DropdownMenuGroup key={session}>
                  <DropdownMenuItem
                    onClick={() => setSession(session as number)}
                    className="hover:bg-amber-800 cursor-pointer p-0.5 rounded-md text-center"
                  >
                    {session}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              );
            })}
          </DropdownMenuContent>
        </div>
      </DropdownMenu>

      <div className="p-4 grid grid-cols-1 gap-2 md:grid-cols-3">
        {/* <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4"> */}
        {drivers.map((driver, index) => (
          <Card
            key={driver.driver_number + '-' + index}
            className="@container/card"
          >
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm mt-1 font-semibold  flex items-center gap-2">
                {driver.team_name}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className="outline"
                  style={{ outlineColor: `#${driver.team_colour}` }}
                >
                  #{driver.driver_number} · {driver.name_acronym}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="text-xl font-semibold  flex items-center gap-2">
              <p className="flex flex-col grow">
                <span style={{ color: `#${driver.team_colour}` }}>
                  {driver.first_name}
                </span>
                <span>{driver.last_name}</span>
                <span className="text-lg flex flex-row items-center">
                  <span className="mr-1 text-2xl ">
                    {getCountryEmoji(driver.country_code)}
                  </span>
                  {getCountryFullName(driver.country_code)}
                </span>
              </p>
              {driver.headshot_url && (
                <Image
                  src={driver.headshot_url}
                  alt={driver.full_name}
                  className="w-16 h-16 rounded-full"
                  width={64}
                  height={64}
                />
              )}
            </CardContent>
            {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium items-center">
              Representing {driver.country_code}{' '}
              <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Competing in session {driver.session_key}
            </div>
          </CardFooter> */}
          </Card>
        ))}
      </div>
    </div>
  );
}
