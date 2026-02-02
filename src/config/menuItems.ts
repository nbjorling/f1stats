import {
  IconClockEdit,
  IconHelmet,
  IconHome2,
  IconTemperature,
  IconWheel,
} from '@tabler/icons-react';

const menuItems = {
  user: {
    name: 'Niklas Björling',
    email: 'niklas.cj.bjorling@gmail.com',
  },
  navMain: [
    {
      title: 'Home',
      url: '/',
      icon: IconHome2,
    },
    {
      title: 'Driver and season stats',
      url: '/drivers',
      icon: IconHelmet,
    },
    {
      title: 'Live Track Dynamics',
      url: '/track',
      icon: IconClockEdit,
    },
    {
      title: 'Pitstops',
      url: '/pitstop',
      icon: IconWheel,
    },
    {
      title: 'Track conditions',
      url: '/track-conditions',
      icon: IconTemperature,
    },
  ],
};

export default menuItems;
