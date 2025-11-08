/**
 * Converts decimal degrees to DMS (Degrees, Minutes, Seconds) format
 * Example: 49.264556 → 49°15'52.4"
 */
export function decimalToDMS(decimal: number, isLatitude: boolean): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);

  // Determine direction
  let direction: string;
  if (isLatitude) {
    direction = decimal >= 0 ? "N" : "S";
  } else {
    direction = decimal >= 0 ? "E" : "W";
  }

  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

/**
 * Formats coordinates in DMS format
 * Example: (49.264556, 19.864528) → "49°15'52.4"N 19°51'52.3"E"
 */
export function formatCoordinatesDMS(latitude: number, longitude: number): string {
  const latDMS = decimalToDMS(latitude, true);
  const lonDMS = decimalToDMS(longitude, false);
  return `${latDMS} ${lonDMS}`;
}

/**
 * Formats coordinates in decimal format with specified precision
 * Example: (49.264556, 19.864528) → "49.2646, 19.8645"
 */
export function formatCoordinatesDecimal(latitude: number, longitude: number, precision = 4): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}
