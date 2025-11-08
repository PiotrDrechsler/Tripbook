-- Add latitude and longitude columns to trips table
-- These columns will store coordinates extracted from mapy.com links

ALTER TABLE trips ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Add comments for documentation
COMMENT ON COLUMN trips.latitude IS 'Latitude coordinate extracted from map URL';
COMMENT ON COLUMN trips.longitude IS 'Longitude coordinate extracted from map URL';

