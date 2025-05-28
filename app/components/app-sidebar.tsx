'use client';

import * as React from 'react';
import { IconHelmet, IconHome2, IconWheel } from '@tabler/icons-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'Niklas Björling',
    email: 'niklas.cj.bjorling@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: IconHome2,
    },
    {
      title: 'Drivers',
      url: '/drivers',
      icon: IconHelmet,
    },
    {
      title: 'Pitstops',
      url: '/pitstop',
      icon: IconWheel,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
