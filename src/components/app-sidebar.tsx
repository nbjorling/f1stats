'use client';

import * as React from 'react';

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from './ui/sidebar';

import menuItems from '../config/menuItems';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={menuItems.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={menuItems.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
