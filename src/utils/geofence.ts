// src/utils/geofence.ts

// 1. Campus target location and radius definition
export const TARGET_CAMPUS_LOCATION = {
  latitude: 22.4716,     // CU Main Campus Latitude
  longitude: 91.7877,    // CU Main Campus Longitude
  radiusMeters: 25000,     // Campus Geofence Radius
};

// 2. Distance calculation function (Haversine Formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// 3. Main Exported Function: Check if user is inside campus boundary
export const isWithinCampus = (userLat: number, userLon: number): boolean => {
  const distance = calculateDistance(
    userLat,
    userLon,
    TARGET_CAMPUS_LOCATION.latitude,
    TARGET_CAMPUS_LOCATION.longitude
  );

  return distance <= TARGET_CAMPUS_LOCATION.radiusMeters;
};