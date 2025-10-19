# REST API Plan - Tripbook

## 1. Resources

### 1.1 Authentication

- **Description**: User authentication and session management
- **Managed by**: Supabase Auth (uses built-in Supabase Auth API)
- **Database table**: `auth.users` (managed by Supabase)
- **Note**: Authentication will be integrated in the future using Supabase's built-in endpoints (`/auth/v1/signup`, `/auth/v1/token`, `/auth/v1/logout`)

### 1.2 Trips

- **Description**: User trip records with map links
- **Database table**: `trips`
- **Ownership**: Each trip belongs to a single user
- **Access control**: Users can only access their own trips (will be enforced when authentication is added)

---

## 2. Endpoints

> **Note**: All trip endpoints are currently public for testing purposes. Authentication will be added in the future, after which all endpoints will require a valid Bearer token.

### 2.1 Create Trip

**HTTP Method**: `POST`

**URL Path**: `/api/trips`

**Description**: Creates a new trip

**Request Headers**:

```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:

```json
{
  "name": "Weekend Hiking in Tatra Mountains",
  "description": "A beautiful two-day hiking trip through the Tatra mountain range with scenic views.",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-11-15"
}
```

**Request Validation**:

- `name`: Required, string, max 100 characters
- `description`: Optional, string, max 2000 characters
- `map_url`: Required, string, must contain "mapy.com"
- `trip_date`: Optional, valid ISO 8601 date format (YYYY-MM-DD)

**Success Response** (201 Created):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Weekend Hiking in Tatra Mountains",
  "description": "A beautiful two-day hiking trip through the Tatra mountain range with scenic views.",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-11-15",
  "created_at": "2025-10-19T14:30:00.000Z",
  "updated_at": "2025-10-19T14:30:00.000Z"
}
```

**Error Responses**:

**400 Bad Request** (Missing required field):

```json
{
  "error": "Validation error",
  "message": "Field 'name' is required",
  "field": "name"
}
```

**400 Bad Request** (Field too long):

```json
{
  "error": "Validation error",
  "message": "Field 'name' must not exceed 100 characters",
  "field": "name"
}
```

**422 Unprocessable Entity** (Invalid map URL):

```json
{
  "error": "Validation error",
  "message": "Map URL must contain 'mapy.com'",
  "field": "map_url"
}
```

---

### 2.2 List Trips

**HTTP Method**: `GET`

**URL Path**: `/api/trips`

**Description**: Retrieves all trips

**Query Parameters**:

- `page`: Optional, integer, default: 1 (page number for pagination)
- `limit`: Optional, integer, default: 20, max: 100 (items per page)
- `sort`: Optional, string, default: "-created_at" (sort field, prefix with "-" for descending)

**Query Examples**:

- `/api/trips` - Get first 20 trips, sorted by newest first
- `/api/trips?page=2&limit=10` - Get second page with 10 items
- `/api/trips?sort=name` - Sort by name ascending
- `/api/trips?sort=-trip_date` - Sort by trip date descending

**Success Response** (200 OK):

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Weekend Hiking in Tatra Mountains",
      "description": "A beautiful two-day hiking trip through the Tatra mountain range with scenic views.",
      "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
      "trip_date": "2025-11-15",
      "created_at": "2025-10-19T14:30:00.000Z",
      "updated_at": "2025-10-19T14:30:00.000Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "City Tour of Kraków",
      "description": null,
      "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
      "trip_date": null,
      "created_at": "2025-10-18T10:15:00.000Z",
      "updated_at": "2025-10-18T10:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "total_pages": 1
  }
}
```

**Success Response** (200 OK - Empty list):

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "total_pages": 0
  }
}
```

**Error Responses**:

**400 Bad Request** (Invalid query parameter):

```json
{
  "error": "Validation error",
  "message": "Parameter 'limit' must be between 1 and 100"
}
```

---

### 2.3 Get Trip Details

**HTTP Method**: `GET`

**URL Path**: `/api/trips/{tripId}`

**Description**: Retrieves details of a specific trip

**Path Parameters**:

- `tripId`: UUID of the trip

**Success Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Weekend Hiking in Tatra Mountains",
  "description": "A beautiful two-day hiking trip through the Tatra mountain range with scenic views.",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-11-15",
  "created_at": "2025-10-19T14:30:00.000Z",
  "updated_at": "2025-10-19T14:30:00.000Z"
}
```

**Error Responses**:

**404 Not Found**:

```json
{
  "error": "Not found",
  "message": "Trip with ID '550e8400-e29b-41d4-a716-446655440000' does not exist"
}
```

---

### 2.4 Update Trip

**HTTP Method**: `PATCH`

**URL Path**: `/api/trips/{tripId}`

**Description**: Updates specific fields of a trip. Only provided fields will be updated.

**Path Parameters**:

- `tripId`: UUID of the trip

**Request Headers**:

```json
{
  "Content-Type": "application/json"
}
```

**Request Body** (all fields optional, send only fields to update):

```json
{
  "name": "Extended Weekend Hiking in Tatra Mountains",
  "description": "Updated: Now a three-day hiking adventure with camping.",
  "trip_date": "2025-11-14"
}
```

**Request Validation**:

- `name`: Optional, string, max 100 characters if provided
- `description`: Optional, string, max 2000 characters if provided, null to clear
- `map_url`: Optional, string, must contain "mapy.com" if provided
- `trip_date`: Optional, valid ISO 8601 date format if provided, null to clear

**Success Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Extended Weekend Hiking in Tatra Mountains",
  "description": "Updated: Now a three-day hiking adventure with camping.",
  "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp&rs=pubt&rs=osm&rs=osm&rs=osm&rs=pubt&ri=24942816&ri=137907847&ri=95037467&ri=1040926778&ri=24942816&mrp=%7B%22c%22%3A132%2C%22dt%22%3A%22%22%2C%22d%22%3Atrue%7D&xc=%5B%5D&x=19.8235480&y=49.2532112&z=13",
  "trip_date": "2025-11-14",
  "created_at": "2025-10-19T14:30:00.000Z",
  "updated_at": "2025-10-19T16:45:00.000Z"
}
```

**Error Responses**:

**400 Bad Request** (Validation error):

```json
{
  "error": "Validation error",
  "message": "Field 'name' must not exceed 100 characters",
  "field": "name"
}
```

**404 Not Found**:

```json
{
  "error": "Not found",
  "message": "Trip with ID '550e8400-e29b-41d4-a716-446655440000' does not exist"
}
```

**422 Unprocessable Entity** (Invalid map URL):

```json
{
  "error": "Validation error",
  "message": "Map URL must contain 'mapy.com'",
  "field": "map_url"
}
```

---

### 2.5 Delete Trip

**HTTP Method**: `DELETE`

**URL Path**: `/api/trips/{tripId}`

**Description**: Permanently deletes a trip (hard delete)

**Path Parameters**:

- `tripId`: UUID of the trip

**Success Response** (204 No Content):
No response body

**Alternative Success Response** (200 OK):

```json
{
  "message": "Trip successfully deleted",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses**:

**404 Not Found**:

```json
{
  "error": "Not found",
  "message": "Trip with ID '550e8400-e29b-41d4-a716-446655440000' does not exist"
}
```

---

## 3. Authentication and Authorization

> **Note**: This section describes the authentication and authorization mechanisms that will be implemented in the future. Currently, all endpoints are public for testing purposes.

### 3.1 Authentication Mechanism

**Provider**: Supabase Auth

**Method**: JWT (JSON Web Tokens)

**Token Type**: Bearer tokens

**Implementation Details** (for future implementation):

- Authentication will use **Supabase's built-in auth endpoints** (not custom Astro API routes):
  - Register: `POST https://<project-ref>.supabase.co/auth/v1/signup`
  - Login: `POST https://<project-ref>.supabase.co/auth/v1/token?grant_type=password`
  - Logout: `POST https://<project-ref>.supabase.co/auth/v1/logout`
- All protected trip endpoints will require an `Authorization` header with format: `Bearer <access_token>`
- Access tokens are obtained from Supabase Auth after successful login/registration
- Tokens will expire after a configured period (default: 1 hour)
- Refresh tokens should be used to obtain new access tokens when they expire
- Tokens contain user ID in JWT payload for authorization checks
- Frontend will use `@supabase/supabase-js` client to interact with Supabase Auth
- Astro middleware will verify JWT tokens for protected routes

### 3.2 Authorization Strategy

**Resource-Level Authorization** (for future implementation):

- All trip operations will require the authenticated user to be the owner of the trip
- User ID will be extracted from the JWT token (not from request body or URL)
- Each request will verify: `trip.user_id === authenticated_user.id`

**Row-Level Security (RLS)** (for future implementation):

- Supabase RLS policies should be enabled on the `trips` table
- Policy: `SELECT/INSERT/UPDATE/DELETE` allowed only when `auth.uid() = user_id`
- This provides defense-in-depth security at the database level

### 3.3 Security Best Practices

**For future implementation when authentication is added:**

1. **Token Storage**:
   - Store access tokens in memory or httpOnly cookies (never localStorage for sensitive apps)
   - Store refresh tokens securely (httpOnly cookies recommended)

2. **HTTPS Only**:
   - All API communication must use HTTPS in production
   - Tokens should never be transmitted over unencrypted connections

3. **Input Sanitization**:
   - All user inputs must be sanitized to prevent XSS attacks
   - Use parameterized queries to prevent SQL injection (handled by Supabase client)

4. **Rate Limiting**:
   - Consider implementing rate limiting on authentication endpoints
   - Protect against brute-force attacks (5 failed login attempts per 15 minutes)

5. **CORS Configuration**:
   - Configure CORS to allow only trusted origins
   - In development: localhost allowed
   - In production: only production domain allowed

---

## 4. Validation and Business Logic

### 4.1 Trip Validation Rules

#### 4.1.1 Field: `name`

- **Type**: String
- **Required**: Yes (for CREATE), Optional (for UPDATE)
- **Min Length**: 1 character
- **Max Length**: 100 characters
- **Validation**:
  - Must not be empty or only whitespace
  - Must not exceed 100 characters
- **Error Messages**:
  - Missing: "Field 'name' is required"
  - Too long: "Field 'name' must not exceed 100 characters"
  - Empty: "Field 'name' cannot be empty"

#### 4.1.2 Field: `description`

- **Type**: String or null
- **Required**: No
- **Min Length**: 0 characters
- **Max Length**: 2000 characters
- **Validation**:
  - Can be null or empty string
  - Must not exceed 2000 characters if provided
- **Error Messages**:
  - Too long: "Field 'description' must not exceed 2000 characters"

#### 4.1.3 Field: `map_url`

- **Type**: String
- **Required**: Yes (for CREATE), Optional (for UPDATE)
- **Format**: Must be a valid URL containing "mapy.com"
- **Validation**:
  - Must contain the substring "mapy.com" (case-insensitive)
  - Should be a valid URL format (protocol optional)
  - Examples of valid URLs:
    - `https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp`
    - `mapy.com/some-route`
    - `http://mapy.com`
- **Error Messages**:
  - Missing: "Field 'map_url' is required"
  - Invalid: "Map URL must contain 'mapy.com'"
  - Empty: "Field 'map_url' cannot be empty"

#### 4.1.4 Field: `trip_date`

- **Type**: Date (ISO 8601 format) or null
- **Required**: No
- **Format**: YYYY-MM-DD
- **Validation**:
  - Must be a valid date in ISO 8601 format if provided
  - Can be null
  - No past/future date restrictions (allow historical and future trips)
- **Error Messages**:
  - Invalid format: "Field 'trip_date' must be in YYYY-MM-DD format"

#### 4.1.5 Field: `user_id`

- **Type**: UUID
- **Required**: Automatic (never provided in request)
- **Source**: Will be extracted from JWT authentication token (when authentication is implemented)
- **Validation**:
  - Currently not used (no authentication)
  - In the future: Automatically set from authenticated user
  - Cannot be overridden by client
  - Must exist in `auth.users` table (enforced by foreign key)

### 4.2 Business Logic Implementation

#### 4.2.1 Create Trip Logic

**Current implementation (without authentication):**

1. **Validate request body** against schema (name, map_url required)
2. **Validate field lengths** (name ≤ 100, description ≤ 2000)
3. **Validate map_url** contains "mapy.com"
4. **Validate trip_date** format if provided
5. **Set timestamps**: `created_at` and `updated_at` to current time
6. **Insert record** into database
7. **Return** created trip object with 201 status

**Future implementation (with authentication):**

- Add step 1: Extract user ID from JWT token in Authorization header
- Add step 7: Insert record with user_id from token

#### 4.2.2 List Trips Logic

**Current implementation (without authentication):**

1. **Parse query parameters** (page, limit, sort)
2. **Validate pagination** parameters (limit between 1-100)
3. **Query database** for all trips
4. **Apply sorting** (default: `-created_at`)
5. **Apply pagination** (offset = (page - 1) \* limit)
6. **Count total** trips for pagination metadata
7. **Return** trips array with pagination info

**Future implementation (with authentication):**

- Add step 1: Extract user ID from JWT token
- Modify step 3: Query database for trips where `user_id = authenticated_user_id`

#### 4.2.3 Get Trip Details Logic

**Current implementation (without authentication):**

1. **Validate tripId** is valid UUID format
2. **Query database** for trip by ID
3. **Check existence**: Return 404 if trip not found
4. **Return** trip object

**Future implementation (with authentication):**

- Add step 1: Extract user ID from JWT token
- Add step 4: Verify ownership: Return 403 if `trip.user_id ≠ authenticated_user_id`

#### 4.2.4 Update Trip Logic

**Current implementation (without authentication):**

1. **Validate tripId** is valid UUID format
2. **Query database** for trip by ID
3. **Check existence**: Return 404 if trip not found
4. **Validate request body** (only provided fields)
5. **Validate field lengths** if fields are provided
6. **Validate map_url** if provided
7. **Update timestamps**: Set `updated_at` to current time
8. **Update record** in database with provided fields
9. **Return** updated trip object

**Future implementation (with authentication):**

- Add step 1: Extract user ID from JWT token
- Add step 4: Verify ownership: Return 403 if `trip.user_id ≠ authenticated_user_id`

#### 4.2.5 Delete Trip Logic

**Current implementation (without authentication):**

1. **Validate tripId** is valid UUID format
2. **Query database** for trip by ID
3. **Check existence**: Return 404 if trip not found
4. **Delete record** from database (hard delete)
5. **Return** 204 No Content or success message

**Future implementation (with authentication):**

- Add step 1: Extract user ID from JWT token
- Add step 4: Verify ownership: Return 403 if `trip.user_id ≠ authenticated_user_id`

### 4.3 Error Handling Strategy

#### 4.3.1 Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "error": "Error type",
  "message": "Human-readable error description",
  "field": "field_name (optional, for validation errors)"
}
```

#### 4.3.2 HTTP Status Code Usage

| Status Code               | Usage                                                              |
| ------------------------- | ------------------------------------------------------------------ |
| 200 OK                    | Successful GET, PATCH requests                                     |
| 201 Created               | Successful POST (create trip)                                      |
| 204 No Content            | Successful DELETE                                                  |
| 400 Bad Request           | Malformed request, invalid parameters, validation errors           |
| 401 Unauthorized          | Missing or invalid authentication token (when auth is implemented) |
| 403 Forbidden             | Valid auth but insufficient permissions (when auth is implemented) |
| 404 Not Found             | Resource (trip) does not exist                                     |
| 409 Conflict              | Duplicate resource (e.g., email already exists - for future auth)  |
| 422 Unprocessable Entity  | Business logic validation failures                                 |
| 500 Internal Server Error | Unexpected server or database errors                               |

#### 4.3.3 Client Error Handling Guidelines

Clients should:

- Check response status code before parsing body
- Display user-friendly error messages from `message` field
- Highlight invalid fields using `field` property
- Retry 500 errors with exponential backoff
- Redirect to login on 401 errors (when authentication is implemented)
- Show "Access denied" message on 403 errors (when authentication is implemented)
- Handle 404 by showing "Resource not found" message

---

## 5. Implementation Notes

### 5.1 Technology Integration

**Astro API Routes**:

- Trip endpoints should be implemented as Astro API routes in `src/pages/api/trips/`
- Use dynamic routes for trip-specific operations: `src/pages/api/trips/[id].ts`
- Leverage Astro's support for TypeScript and type-safe responses

**Supabase Client**:

- Use `@supabase/supabase-js` client library
- Initialize client with project URL and anon key
- Use RLS policies for automatic authorization enforcement (when authentication is added)
- Leverage Supabase's built-in auth helpers for Astro (when authentication is added)

**TypeScript Types**:

- Define shared types in `src/types.ts`
- Create DTOs (Data Transfer Objects) for request/response bodies
- Use database types generated from Supabase schema

### 5.2 Database Considerations

**Indexes**:

- Ensure B-tree index exists on `trips.user_id` for efficient filtering (for future use with authentication)
- Consider adding index on `created_at` for sorting optimization

**RLS Policies** (for future implementation when authentication is added):

```sql
-- Enable RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only insert trips for themselves
CREATE POLICY "Users can create own trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own trips
CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only delete their own trips
CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = user_id);
```

**Automatic Timestamps**:

- Use database triggers or Supabase functions to auto-update `updated_at`
- Ensure `created_at` defaults to `now()` at database level

### 5.3 Testing Strategy

**Unit Tests**:

- Test validation functions independently
- Test business logic for each endpoint
- Mock Supabase client for isolated testing

**Integration Tests**:

- Test complete API flows with real Supabase instance
- Test authentication and authorization (when implemented)
- Test CRUD operations end-to-end

**E2E Tests** (Playwright):

- Test create trip → list trips → update trip → delete trip flow
- Test user registration → login → create trip → view trip flow (when authentication is added)
- As specified in PRD US-009

### 5.4 Future Enhancements

Potential API extensions outside MVP scope:

- **User authentication and authorization** (next priority)
  - Integrate Supabase Auth built-in endpoints (no custom implementation needed):
    - Register: `POST https://<project-ref>.supabase.co/auth/v1/signup`
    - Login: `POST https://<project-ref>.supabase.co/auth/v1/token?grant_type=password`
    - Logout: `POST https://<project-ref>.supabase.co/auth/v1/logout`
  - Add JWT verification middleware in Astro
  - Protect all trip endpoints with JWT authentication
  - Enforce user ownership for all trip operations using RLS policies
  - Use `@supabase/supabase-js` client in frontend for auth operations
- Search and filter trips by name or description
- Batch operations (bulk delete)
- Trip sharing endpoints (create shareable links)
- Tag management endpoints
- Export trips to various formats (JSON, CSV)
- Trip statistics and analytics endpoints
- Upload and manage trip photos
- Real-time updates using Supabase subscriptions

---

## 6. API Versioning

**Current Version**: v1 (implicit)

**Versioning Strategy**:

- For MVP, no explicit version prefix in URLs
- If breaking changes needed in future, introduce `/api/v2/` prefix
- Maintain backwards compatibility in v1 endpoints

**Deprecation Policy**:

- Announce deprecations 6 months before removal
- Provide migration guides for breaking changes
- Use custom headers to warn about deprecated endpoints

---

## 7. Response Time and Performance Targets

**Target Response Times**:

- Authentication endpoints: < 500ms (when implemented)
- List trips (paginated): < 300ms
- Get/Create/Update/Delete single trip: < 200ms

**Performance Optimization Strategies**:

- Leverage database indexes on `user_id` and `created_at`
- Use Supabase connection pooling
- Implement pagination to limit result set sizes
- Consider response caching for frequently accessed data (future)
- Monitor query performance with Supabase dashboard

**Scalability Considerations**:

- Stateless API design enables horizontal scaling
- Supabase handles database scaling automatically
- Astro static generation reduces server load
- Consider CDN for API responses if global users (future)

---

## 8. Monitoring and Logging

**Logging Requirements**:

- Log all authentication attempts (success and failure) - when implemented
- Log all CRUD operations with user ID and timestamp
- Log validation errors for analysis
- Log 5xx errors with stack traces

**Monitoring Metrics**:

- Request count per endpoint
- Response time percentiles (p50, p95, p99)
- Error rate by status code
- Authentication success/failure rate (when implemented)

**Tools**:

- Use Supabase's built-in logging and analytics
- Consider integration with external monitoring (e.g., Sentry for errors)
- GitHub Actions for CI/CD pipeline monitoring

---

## Appendix A: Example API Flows

### Flow 1: Complete Trip Management Journey

```
1. Create first trip
   POST /api/trips
   Body: { "name": "Trip 1", "map_url": "https://mapy.com/pl/zakladni?planovani-trasy&rc=991i0x8QxXe1Ix8ComcvbhE2dNMx8Lvh991i0lAp" }
   Response: 201 Created

2. List all trips
   GET /api/trips
   Response: 200 OK with trips array

3. View trip details
   GET /api/trips/{tripId}
   Response: 200 OK with trip object

4. Update trip
   PATCH /api/trips/{tripId}
   Body: { "description": "Updated description" }
   Response: 200 OK with updated trip

5. Delete trip
   DELETE /api/trips/{tripId}
   Response: 204 No Content
```

### Flow 2: Error Handling Example

```
1. Attempt to create trip with invalid map URL
   POST /api/trips
   Body: { "name": "Trip", "map_url": "https://google.com/maps" }
   Response: 422 Unprocessable Entity
   Body: { "error": "Validation error", "message": "Map URL must contain 'mapy.com'", "field": "map_url" }

2. Attempt to get non-existent trip
   GET /api/trips/{invalid_trip_id}
   Response: 404 Not Found
```

---

## Appendix B: Request/Response Type Definitions

```typescript
// Trip Types
interface CreateTripRequest {
  name: string;
  description?: string | null;
  map_url: string;
  trip_date?: string | null;
}

interface UpdateTripRequest {
  name?: string;
  description?: string | null;
  map_url?: string;
  trip_date?: string | null;
}

interface Trip {
  id: string;
  name: string;
  description: string | null;
  map_url: string;
  trip_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ListTripsResponse {
  data: Trip[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Error Types
interface ErrorResponse {
  error: string;
  message: string;
  field?: string;
}
```
