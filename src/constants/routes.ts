export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  REGISTER: '/register',
  PROFILE: '/profile',
  MY_DOMAINS: '/my-domains',
  SETTINGS: '/settings',
} as const;

export const ROUTE_NAMES = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.SEARCH]: 'Search Domain',
  [ROUTES.REGISTER]: 'Register Domain',
  [ROUTES.PROFILE]: 'Profile',
  [ROUTES.MY_DOMAINS]: 'My Domains',
  [ROUTES.SETTINGS]: 'Settings',
} as const; 