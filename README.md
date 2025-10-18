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

Built as an MVP for certification, Tripbook leverages Astro islands with React, TypeScript, and Supabase for a lightweight yet robust experience.

## Tech Stack

- **Framework**: Astro 5 (Static Site Generation + Island Architecture)
- **UI Library**: React 19 (Interactive components)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + Shadcn/ui
- **Backend-as-a-Service**: Supabase (Auth, Postgres, RLS, REST/GraphQL, real-time)
- **Testing**: Playwright (E2E)
- **CI/CD**: GitHub Actions → Netlify

## Getting Started

### Prerequisites

- Node.js v22.14.0 (managed via [nvm](https://github.com/nvm-sh/nvm))
- Supabase Project (URL & Public Anon Key)

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

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view in your browser.

## Available Scripts

In the project directory, you can run:

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Start Astro in dev mode (localhost) |
| `npm run build`    | Build the production site           |
| `npm run preview`  | Preview the built site locally      |
| `npm run astro`    | Run Astro CLI commands              |
| `npm run lint`     | Lint all files with ESLint          |
| `npm run lint:fix` | Lint & fix issues automatically     |
| `npm run format`   | Format all files with Prettier      |

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

**Next Steps**

- Embed mapy.com map iframes inline
- Expand test coverage
- Add rich notifications UI
- Implement soft deletes or archiving

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
