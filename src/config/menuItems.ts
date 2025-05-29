import {
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
      title: 'Drivers',
      url: '/drivers',
      icon: IconHelmet,
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
