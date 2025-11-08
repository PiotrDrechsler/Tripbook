# Feature: Mapy.com Link Expansion

## 📝 Overview

This feature automatically extracts GPS coordinates from mapy.com short links and stores them with trips. Users can paste a mapy.com link (including short links like `https://mapy.com/s/hokakucoto`) and the system will:

1. Follow the redirect to get the full URL
2. Extract latitude and longitude coordinates
3. Store them in the database
4. Display them in the trip details with a Google Maps link

## 🏗️ Architecture

### Backend: Edge Function

**Location:** `supabase/functions/expand-mapy-link/index.ts`

**Purpose:** Expands mapy.com short URLs and extracts coordinates

**API:**

- **Method:** POST
- **Endpoint:** `/functions/v1/expand-mapy-link`
- **Request Body:**
  ```json
  {
    "shortUrl": "https://mapy.com/s/hokakucoto"
  }
  ```
- **Response:**
  ```json
  {
    "latitude": 49.2794949,
    "longitude": 19.7653139,
    "finalUrl": "https://mapy.com/pl/zakladni?...&x=19.7653139&y=49.2794949..."
  }
  ```

**Features:**

- 5-second timeout protection
- CORS enabled
- Error handling for invalid URLs, timeouts, and missing coordinates
- Follows redirects automatically

### Frontend: React Hook

**Location:** `src/lib/hooks/useMapyLink.ts`

**Purpose:** React hook for extracting coordinates from mapy.com links

**API:**

```typescript
const { latitude, longitude, loading, error, success } = useMapyLink(mapUrl);
```

**Features:**

- 300ms debouncing to avoid excessive API calls
- Automatic validation (checks for "mapy.com" in URL)
- Loading, error, and success states
- Returns null coordinates when URL is empty or invalid

### Database Schema

**Migration:** `supabase/migrations/20251108195656_add_coordinates_to_trips.sql`

**Changes:**

- Added `latitude FLOAT` column to `trips` table
- Added `longitude FLOAT` column to `trips` table
- Both columns are nullable (for backward compatibility)

### Updated Components

#### 1. CreateTripForm (`src/components/trips/CreateTripForm.tsx`)

- Integrated `useMapyLink` hook
- Real-time coordinate extraction as user types
- Visual feedback:
  - **Loading:** Gray spinner with "Wyciąganie współrzędnych..."
  - **Error:** Red alert with error message
  - **Success:** Green badge showing coordinates
- Validates coordinates exist before submission
- Sends coordinates to API along with trip data

#### 2. TripEditForm (`src/components/trips/TripEditForm.tsx`)

- Same coordinate extraction features as CreateTripForm
- Only updates coordinates if map URL changes
- Preserves existing coordinates if URL unchanged

#### 3. TripDetailsView (`src/components/trips/TripDetailsView.tsx`)

- Displays coordinates in a green badge if available
- Shows coordinates with 7 decimal precision
- Includes "Google Maps" button linking to coordinates
- Format: `📍 Współrzędne: 49.2794949, 19.7653139`

### Updated Services

**Location:** `src/lib/services/tripService.ts`

**Changes:**

- `listTrips()` now includes `latitude` and `longitude` in mapped DTOs
- All CRUD operations support the new coordinate fields

### Updated Types

**Location:** `src/db/database.types.ts`

**Changes:**

- Added `latitude: number | null` to `trips.Row`
- Added `latitude?: number | null` to `trips.Insert`
- Added `latitude?: number | null` to `trips.Update`
- Same for `longitude`

## 🚀 Usage

### For Users

1. **Creating a Trip:**
   - Paste a mapy.com link (short or full) into the "Link do mapy" field
   - Wait ~300ms for coordinates to be extracted
   - Green badge appears showing coordinates
   - Submit the form

2. **Editing a Trip:**
   - Change the map URL to extract new coordinates
   - Coordinates update automatically
   - Save changes

3. **Viewing a Trip:**
   - Coordinates display below the map section
   - Click "Google Maps" button to view location in Google Maps

### For Developers

#### Testing the Edge Function Locally

```bash
# Start Supabase functions
supabase functions serve

# In another terminal, test the function
curl -X POST http://localhost:54321/functions/v1/expand-mapy-link \
  -H "Content-Type: application/json" \
  -d '{"shortUrl":"https://mapy.com/s/hokakucoto"}'
```

#### Running the Application

```bash
# Apply database migrations
supabase db push

# Start the dev server
npm run dev
```

#### Environment Variables

The hook automatically detects the Supabase URL:

- Uses `import.meta.env.PUBLIC_SUPABASE_URL` if available
- Falls back to `http://localhost:54321` for local development

## 📋 Implementation Checklist

- [x] Edge Function created and tested
- [x] React hook `useMapyLink` implemented
- [x] CreateTripForm updated with coordinate extraction
- [x] TripEditForm updated with coordinate extraction
- [x] Database migration created
- [x] Database types updated
- [x] TripService updated to include coordinates
- [x] TripDetailsView displays coordinates
- [x] Linter errors fixed
- [x] Visual feedback for loading/error/success states

## 🐛 Known Issues & Solutions

### Issue: CORS Error

**Solution:** Edge Function includes proper CORS headers in response

### Issue: Timeout on slow connections

**Solution:** 5-second timeout implemented with proper error handling

### Issue: Hook triggers too many times

**Solution:** 300ms debounce implemented

### Issue: Coordinates not found in URL

**Solution:** Returns user-friendly error message in Polish

## 🔧 Configuration

### Supabase URL

The hook uses the following priority for Supabase URL:

1. `import.meta.env.PUBLIC_SUPABASE_URL` (production)
2. `http://localhost:54321` (local development)

To configure for production, set the environment variable:

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

## 📚 Technical Details

### Coordinate Format

- **mapy.com format:** `x=longitude, y=latitude`
- **Google Maps format:** `latitude, longitude`
- **Conversion:** The Edge Function handles the conversion automatically

### Regex Patterns

```typescript
const xMatch = finalUrl.match(/[&?]x=([^&]+)/); // longitude
const yMatch = finalUrl.match(/[&?]y=([^&]+)/); // latitude
```

### Precision

Coordinates are displayed with 7 decimal places (~1cm precision):

```typescript
latitude.toFixed(7);
longitude.toFixed(7);
```

## 🎨 UI/UX Features

### Loading State

- Spinner animation
- Gray background
- Text: "Wyciąganie współrzędnych..."

### Error State

- Red border and background
- Warning icon (⚠)
- Error message in Polish

### Success State

- Green border and background
- Checkmark icon (✓)
- Coordinates display
- Dark mode support

### Coordinates Display (Details Page)

- Green badge with coordinates
- Google Maps link button
- Responsive layout

## 🔄 Migration Path

For existing trips without coordinates:

1. Coordinates are nullable, so old trips work fine
2. Users can edit trips to add coordinates
3. Coordinates will be extracted when map URL is updated

## 📝 Future Enhancements

Potential improvements:

- [ ] E2E tests with Playwright
- [ ] Batch coordinate extraction for existing trips
- [ ] Support for other map providers (Google Maps, OpenStreetMap)
- [ ] Map preview using coordinates instead of iframe
- [ ] Coordinate validation (check if in valid range)
- [ ] Distance calculation between trips
- [ ] Map view showing all trips

## 📖 References

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Fetch API](https://deno.land/manual/runtime/web_platform_apis)
- [React Hooks](https://react.dev/reference/react)
- [mapy.com API](https://mapy.com)
