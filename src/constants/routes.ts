export const ROUTES = {
  HOME: '/',
  MOVIE_DETAIL: '/movie/:id',
  SEAT_SELECTION: '/movie/:id/seats',
  CONFIRMATION: '/booking/:bookingId',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const
