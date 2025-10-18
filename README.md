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
5. [API Documentation](#api-documentation)
6. [Project Scope](#project-scope)
7. [Project Status](#project-status)
8. [License](#license)

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

## API Documentation

Tripbook provides a RESTful API for managing trips. All endpoints require authentication using a Bearer token obtained from Supabase Auth.

### Authentication

All API requests must include an `Authorization` header:

```http
Authorization: Bearer <your-access-token>
```

### Base URL

```
http://localhost:4321/api  (development)
https://your-site.netlify.app/api  (production)
```

### Endpoints

#### Create Trip

Creates a new trip for the authenticated user.

**Request**

```http
POST /api/trips
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Weekend in the Mountains",
  "description": "Beautiful hiking trails and scenic views",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-06-15"
}
```

**Response** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7f8e9d10-1234-5678-90ab-cdef12345678",
  "name": "Weekend in the Mountains",
  "description": "Beautiful hiking trails and scenic views",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-06-15",
  "created_at": "2025-10-18T12:00:00.000Z",
  "updated_at": "2025-10-18T12:00:00.000Z"
}
```

**Validation Rules**

- `name`: required, 1-100 characters
- `description`: optional, max 2000 characters
- `map_url`: required, valid URL containing "mapy.com"
- `trip_date`: required, format YYYY-MM-DD

**Error Response** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "name",
      "message": "Trip name is required"
    }
  ]
}
```

---

#### List Trips

Retrieves a paginated list of trips for the authenticated user.

**Request**

```http
GET /api/trips?page=1&limit=20&sort=created_at&order=desc
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter | Type    | Default      | Description                             |
| --------- | ------- | ------------ | --------------------------------------- |
| `page`    | integer | 1            | Page number (positive integer)          |
| `limit`   | integer | 20           | Items per page (1-100)                  |
| `sort`    | string  | `created_at` | Sort field: `created_at` or `trip_date` |
| `order`   | string  | `desc`       | Sort order: `asc` or `desc`             |

**Response** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "7f8e9d10-1234-5678-90ab-cdef12345678",
      "name": "Weekend in the Mountains",
      "description": "Beautiful hiking trails and scenic views",
      "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
      "trip_date": "2025-06-15",
      "created_at": "2025-10-18T12:00:00.000Z",
      "updated_at": "2025-10-18T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 53,
    "pages": 3
  }
}
```

---

#### Get Trip Details

Retrieves details of a single trip by ID.

**Request**

```http
GET /api/trips/{id}
Authorization: Bearer <token>
```

**Response** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7f8e9d10-1234-5678-90ab-cdef12345678",
  "name": "Weekend in the Mountains",
  "description": "Beautiful hiking trails and scenic views",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-06-15",
  "created_at": "2025-10-18T12:00:00.000Z",
  "updated_at": "2025-10-18T12:00:00.000Z"
}
```

**Error Response** `404 Not Found`

```json
{
  "error": "Trip not found"
}
```

---

#### Update Trip

Updates an existing trip for the authenticated user.

**Request**

```http
PUT /api/trips/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Trip Name",
  "description": "Updated description",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-07-20"
}
```

**Response** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7f8e9d10-1234-5678-90ab-cdef12345678",
  "name": "Updated Trip Name",
  "description": "Updated description",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-07-20",
  "created_at": "2025-10-18T12:00:00.000Z",
  "updated_at": "2025-10-18T13:30:00.000Z"
}
```

**Error Response** `404 Not Found`

```json
{
  "error": "Trip not found"
}
```

---

#### Delete Trip

Permanently deletes a trip for the authenticated user.

**Request**

```http
DELETE /api/trips/{id}
Authorization: Bearer <token>
```

**Response** `204 No Content`

(Empty response body)

**Error Response** `404 Not Found`

```json
{
  "error": "Trip not found"
}
```

---

### Common Error Responses

#### 401 Unauthorized

```json
{
  "error": "Missing or invalid Authorization header"
}
```

or

```json
{
  "error": "Invalid or expired token"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Failed to create trip"
}
```

### Example Usage

#### Using cURL

```bash
# Create a trip
curl -X POST https://your-site.netlify.app/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mountain Adventure",
    "description": "Exploring the peaks",
    "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
    "trip_date": "2025-06-15"
  }'

# List trips
curl https://your-site.netlify.app/api/trips?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get trip details
curl https://your-site.netlify.app/api/trips/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update trip
curl -X PUT https://your-site.netlify.app/api/trips/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description",
    "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
    "trip_date": "2025-07-20"
  }'

# Delete trip
curl -X DELETE https://your-site.netlify.app/api/trips/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Using JavaScript Fetch

```javascript
// Get Supabase session token
const {
  data: { session },
} = await supabase.auth.getSession();
const token = session.access_token;

// Create a trip
const response = await fetch("/api/trips", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Mountain Adventure",
    description: "Exploring the peaks",
    map_url:
      "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
    trip_date: "2025-06-15",
  }),
});

const trip = await response.json();
console.log(trip);
```

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
- ✅ RESTful API with full CRUD operations
- ✅ Trip validation & database constraints
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
