// Project OSRM (Open Source Routing Machine) Service (Free & Open Source)
// Calculates turn-by-turn driving routes, real distances (km), and ETAs (minutes).

export interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

export interface OsrmRouteResult {
  distanceKm: number;
  durationMinutes: number;
  waypoints: RouteCoordinates[];
  summary: string;
  steps: string[];
}

export async function getEmergencyRoute(
  start: RouteCoordinates,
  end: RouteCoordinates
): Promise<OsrmRouteResult> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const primaryRoute = data.routes[0];
    const distanceKm = +(primaryRoute.distance / 1000).toFixed(1);
    const durationMinutes = Math.max(1, Math.round(primaryRoute.duration / 60));

    const waypoints: RouteCoordinates[] = primaryRoute.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lon,
      })
    );

    const steps: string[] = (primaryRoute.legs?.[0]?.steps || []).map(
      (step: any) => step.maneuver?.instruction || step.name || 'Continue forward'
    );

    return {
      distanceKm,
      durationMinutes,
      waypoints,
      summary: primaryRoute.legs?.[0]?.summary || 'Fastest emergency route',
      steps,
    };
  } catch (error) {
    // Offline Haversine Fallback Calculation
    const R = 6371; // Earth's radius in km
    const dLat = ((end.latitude - start.latitude) * Math.PI) / 180;
    const dLon = ((end.longitude - start.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((start.latitude * Math.PI) / 180) *
        Math.cos((end.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistKm = R * c;

    // Road factor approx 1.3x straight line, emergency vehicle avg speed 40 km/h
    const distanceKm = +(straightDistKm * 1.3).toFixed(1);
    const durationMinutes = Math.max(2, Math.round((distanceKm / 40) * 60));

    // Linear interpolation waypoints for fallback animation
    const numPoints = 8;
    const waypoints: RouteCoordinates[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const ratio = i / numPoints;
      waypoints.push({
        latitude: start.latitude + (end.latitude - start.latitude) * ratio,
        longitude: start.longitude + (end.longitude - start.longitude) * ratio,
      });
    }

    return {
      distanceKm,
      durationMinutes,
      waypoints,
      summary: 'Emergency Corridor via Arterial Road',
      steps: [
        'Depart station with active sirens & beacons',
        'Head towards patient GPS ping coordinates',
        'Arrive at scene entrance',
      ],
    };
  }
}
