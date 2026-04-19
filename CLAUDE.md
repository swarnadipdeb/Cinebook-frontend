# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React + Vite + Tailwind CSS v4 movie ticket booking system with a dark/cinematic theme. The app uses React Router for navigation, React Context API for state management, and mock data for movies/theaters/showtimes.

## Commands

```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production (skips tsc — Vite handles types)
npm run preview  # Preview the production build
```

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, NOT the old CLI)
- **Routing**: React Router v7
- **State**: React Context API (`AuthContext` with `isLoggedIn`, `BookingContext`)
- **Language**: TypeScript

## Architecture

```
src/
├── App.tsx                   # Root — wraps providers
├── components/
│   ├── common/               # Shared: Navbar, Footer
│   └── features/            # Feature modules:
│       ├── movies/          # MovieCard, MovieGrid
│       ├── seats/           # SeatMap, SeatRow, SeatLegend
│       └── booking/         # BookingSummary
├── pages/                   # Route-level pages
│   ├── Home/                # Movie listing
│   ├── MovieDetail/         # Movie info + showtime selection
│   ├── SeatSelection/       # Interactive seat picker
│   ├── Confirmation/        # Booking ticket with QR
│   ├── Auth/                # Login + Register with validation
│   ├── Profile/             # User profile + booking history
│   └── Admin/               # Movie + booking management
├── hooks/                   # useMovies
├── store/                   # AuthContext (with isLoggedIn), BookingContext
├── services/                # movieService, bookingService, authService, api (axios)
├── data/                    # Mock: movies, theaters, showtimes
├── utils/                   # formatDate, formatPrice, generateTicketId
├── constants/               # config, routes, seatTypes
└── styles/                  # global.css, variables.css (dark theme tokens)
```

## Key Conventions

- All route paths are defined in `src/constants/routes.ts` — no string literals in components
- Seat types defined in `src/constants/seatTypes.ts`
- Booking confirmation uses React state/navigation (`navigate` with `state`) — no URL params for booking data
- Mock services return Promises for async simulation
- Page components at `src/pages/<Page>/` import from `../../constants/` (2 levels up)
- Feature components at `src/components/features/<feature>/` import from `../../../constants/` (3 levels up)
- CSS Modules (`.module.css`) used for component styles; Tailwind for page/layout styles

## Design Tokens (CSS Variables)

- Background: `--color-bg` (#0d0d12), `--color-bg-card` (#16161d)
- Primary: `--color-primary` (#aa3bff) — accent for buttons, selected states
- Seats: `--color-seat-available` (green), `--color-seat-selected` (purple), `--color-seat-premium` (amber), `--color-seat-booked` (gray)
