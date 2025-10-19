-- Migration: Add trigger to automatically update updated_at timestamp
-- Purpose: Ensure updated_at is automatically set to current timestamp on every UPDATE
-- Affected tables: trips

-- Create a function that updates the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that calls the function before each UPDATE
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comment the trigger for documentation
COMMENT ON TRIGGER set_updated_at ON public.trips IS 
  'Automatically updates the updated_at column to the current timestamp whenever a row is updated';

