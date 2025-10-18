# REST API Plan

## 1. Resources

- **User** (`auth.users`): managed by Supabase Auth service
- **Trip** (`trips`): stores user trips with link to mapy.com

## 2. Endpoints

### 2.2 Trips

All `/api/trips` endpoints require bearer token authentication. Users can only access their own trips.

#### 2.2.1 Create Trip

- Method: POST
- URL: `/api/trips`
- Description: Add a new trip for authenticated user
- Request Body:

```json
{
  "name": "Trip name (max 100 chars)",
  "description": "Optional description (max 2000 chars)",
  "map_url": "https://mapy.com/...",
  "trip_date": "YYYY-MM-DD"
}
```

- Success Response (201 Created):

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "...",
  "description": "...",
  "map_url": "...",
  "trip_date": "YYYY-MM-DD",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

- Validation Rules:
  - `name` required, max length 100
  - `map_url` required, must contain `"mapy.com"`
  - `description` max length 2000

#### 2.2.2 List Trips

- Method: GET
- URL: `/api/trips`
- Description: Retrieve paginated list of authenticated user’s trips
- Query Parameters:
  - `page` (integer, default 1)
  - `limit` (integer, default 20)
  - `sort` (`created_at` or `trip_date`, default `created_at`)
  - `order` (`asc` or `desc`, default `desc`)
- Success Response (200 OK):

```json
{
  "data": [ { /* trip object */ }, ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 53,
    "pages": 3
  }
}
```

#### 2.2.3 Get Trip Details

- Method: GET
- URL: `/api/trips/{id}`
- Description: Retrieve details for a single trip belonging to authenticated user
- Path Parameter:
  - `id` (UUID)
- Success Response (200 OK): trip object
- Error Responses:
  - 404 Not Found: trip does not exist or does not belong to user

#### 2.2.4 Update Trip

- Method: PUT
- URL: `/api/trips/{id}`
- Description: Update an existing trip
- Path Parameter:
  - `id` (UUID)
- Request Body: same schema as Create Trip
- Success Response (200 OK): updated trip object
- Error Responses:
  - 400 Bad Request: validation errors
  - 404 Not Found: trip not found or unauthorized

#### 2.2.5 Delete Trip

- Method: DELETE
- URL: `/api/trips/{id}`
- Description: Permanently delete a trip
- Path Parameter:
  - `id` (UUID)
- Success Response (204 No Content)
- Error Responses:
  - 404 Not Found: trip not found or unauthorized

## 3. Authentication and Authorization

- Utilize Supabase Auth JWT-based sessions
- Protect all `/api/trips` routes via middleware that verifies `Authorization: Bearer <token>`
- Enforce Row-Level Security (RLS) in database: `user_id = auth.uid()`

## 4. Validation and Business Logic

- Enforce input validation in API layer and database constraints:
  - `map_url` must include `"mapy.com"` (DB CHECK and API regex)
  - `name` length ≤ 100, `description` ≤ 2000
- Ensure users only access their own trips (filter by `user_id`)
- Implement pagination and sorting in list endpoint using indexed `user_id` and `created_at`
- Return appropriate HTTP status codes and error messages

<!-- End of API Plan -->
