# Tripbook

> Minimalist web app for archiving and managing your custom trip routes from mapy.com.

[![CI Status](https://github.com/your-org/Tripbook/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/Tripbook/actions)  
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

## Project Description

Tripbook is a minimalist web application that lets you save, describe, and revisit your custom trip routes planned on mapy.com. It provides a personal library of your trips, enabling you to:

- Store URLs to mapy.com routes with built-in domain validation.
- Add optional descriptions and dates to trips.
- View, edit, and delete trips via a clean, single-page interface.
- Calculate route distance and travel time from your current location using Google Routes API.
- Support for multiple waypoints in trip routes.

Built as an MVP for certification, Tripbook leverages Astro islands with React, TypeScript, and Supabase for a lightweight yet robust experience.

## Tech Stack

- **Framework**: Astro 5 (Static Site Generation + Island Architecture)
- **UI Library**: React 19 (Interactive components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **Backend-as-a-Service**: Supabase (Auth, Postgres, RLS, REST/GraphQL, real-time)
- **External APIs**: Google Routes API (route calculation, distance, and travel time)
- **Testing**:
  - **Unit & Integration**: Vitest + Testing Library (React)
  - **E2E**: Playwright (multi-browser, trace viewer, auto-waiting)
- **CI/CD**: GitHub Actions → Netlify

## Getting Started

### Prerequisites

- Node.js v22.14.0 (managed via [nvm](https://github.com/nvm-sh/nvm))
- Supabase Project (URL & Public Anon Key)
- Google Cloud Project with Routes API enabled (API Key)

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/Tripbook.git
cd Tripbook

# Use the correct Node version
nvm use

# Install dependencies
npm install

# Create a .env file in the project root with:
# SUPABASE_URL=<your-supabase-url>
# SUPABASE_ANON_KEY=<your-anon-key>
# GOOGLE_ROUTES_API_KEY=<your-google-routes-api-key>

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in your browser.

### Google Routes API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the [Routes API](https://console.cloud.google.com/apis/library/routes.googleapis.com)
4. Create an API key in [Credentials](https://console.cloud.google.com/apis/credentials)
5. Add the API key to your `.env` file as `GOOGLE_ROUTES_API_KEY`

For detailed usage examples, see [Routes Service Documentation](src/lib/services/routesService.example.md).

## Available Scripts

In the project directory, you can run:

### Development

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start Astro in dev mode (localhost) |
| `npm run build`   | Build the production site           |
| `npm run preview` | Preview the built site locally      |
| `npm run astro`   | Run Astro CLI commands              |

### Code Quality

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `npm run lint`     | Lint all files with ESLint      |
| `npm run lint:fix` | Lint & fix issues automatically |
| `npm run format`   | Format all files with Prettier  |

### Testing

| Command                    | Description                                 |
| -------------------------- | ------------------------------------------- |
| `npm run test`             | Run unit tests in watch mode                |
| `npm run test:unit`        | Run all unit tests once                     |
| `npm run test:unit:watch`  | Run unit tests in watch mode                |
| `npm run test:unit:ui`     | Run unit tests with Vitest UI               |
| `npm run test:coverage`    | Run tests with coverage report              |
| `npm run test:e2e`         | Run E2E tests with Playwright               |
| `npm run test:e2e:ui`      | Run E2E tests in Playwright UI mode         |
| `npm run test:e2e:debug`   | Run E2E tests in debug mode                 |
| `npm run test:e2e:report`  | Show Playwright test report                 |
| `npm run test:e2e:codegen` | Generate E2E tests using Playwright codegen |

For detailed testing documentation, see [TESTING.md](TESTING.md).

## Project Scope

### In Scope (MVP)

- User registration & login (email/password)
- Session management & access control
- CRUD operations for trips:
  - Name (required, ≤100 chars)
  - Description (optional, ≤2000 chars)
  - Map URL (required, `mapy.com` validation)
  - Date (optional)
- List view & detail panel (name, description, date, “Open Map” link)
- Edit & delete trips (hard delete)
- Modal/side panel forms for add/edit
- Basic responsive design
- One Playwright E2E test (registration → login → add trip → display)
- CI/CD with GitHub Actions & automatic Netlify deployment

### Out of Scope

- Landing page or separate dashboard
- Soft deletes, toast notifications, animations, skeleton loaders
- Mobile hamburger menu, breadcrumbs, advanced navigation
- Trip sharing, tagging, photo uploads, analytics
- Password strength meter or confirm-password field

## Project Status

This repository contains the MVP implementation:

- ✅ Authentication & session management
- ✅ Trip CRUD functionality & validation
- ✅ Interactive UI with Astro + React
- ✅ E2E testing pipeline
- ✅ Automated CI/CD & Netlify deployment

**Recent Additions**

- ✅ Google Routes API integration for route calculation
- ✅ Distance and travel time display from user's location
- ✅ Support for multiple waypoints in trip routes
- ✅ Interactive route information component
- ✅ Complete testing environment (Vitest + Playwright)
- ✅ Unit tests for utilities and components
- ✅ E2E testing infrastructure with Page Object Model

**Next Steps**

- Embed mapy.com map iframes inline
- Expand test coverage
- Add rich notifications UI
- Implement soft deletes or archiving
- Add route visualization on map
- Cache calculated routes in database

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
