-- Add locations array column to trips table
-- This column will store multiple waypoints/coordinates for a trip route
-- Format: JSONB array of objects with latitude and longitude
-- Example: [{"latitude": 49.2646, "longitude": 19.8645}, {"latitude": 50.0614, "longitude": 19.9383}]

ALTER TABLE trips ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT '[]'::JSONB;

-- Add comment for documentation
COMMENT ON COLUMN trips.locations IS 'Array of waypoint coordinates for the trip route. Each element contains latitude and longitude.';

-- Add check constraint to ensure locations is an array
ALTER TABLE trips ADD CONSTRAINT chk_trips_locations_is_array 
  CHECK (jsonb_typeof(locations) = 'array');

-- Create index for better query performance on locations
CREATE INDEX IF NOT EXISTS idx_trips_locations ON trips USING GIN (locations);

