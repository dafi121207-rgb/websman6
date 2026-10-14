export const FIELD_LAT = Number(process.env.NEXT_PUBLIC_FIELD_LAT ?? -7.2278);
export const FIELD_LNG = Number(process.env.NEXT_PUBLIC_FIELD_LNG ?? 107.9087);
export const FIELD_RADIUS = Number(process.env.NEXT_PUBLIC_FIELD_RADIUS ?? 100);

/** Haversine distance in meters */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
