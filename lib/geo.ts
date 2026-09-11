export const SIKKIM_CENTER = {
  lat: 27.2600,
  lng: 88.5400,
};

export const DEFAULT_MAP_ZOOM = 11;
export const REGIONAL_OVERVIEW_ZOOM = 8;

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const NORTHEAST_INDIA_BOUNDS: BoundingBox = {
  north: 29.5,
  south: 22.0,
  east: 97.5,
  west: 87.5,
};

export function getCenterOfPolygon(points: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (!points || points.length === 0) return SIKKIM_CENTER;
  let totalLat = 0;
  let totalLng = 0;
  for (const p of points) {
    totalLat += p.lat;
    totalLng += p.lng;
  }
  return {
    lat: totalLat / points.length,
    lng: totalLng / points.length,
  };
}
