// POST /api/nearby-gaps
// Find available gaps within a radius of user location

const supabase = require('./_shared/supabase');
const { haversineDistance } = require('./_shared/haversine');
const { handleOptions, success, error } = require('./_shared/response');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return error('Method not allowed', 405);
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      latitude, 
      longitude, 
      radius = 100, 
      threshold = 10, 
      gridResolution = 10 
    } = body;

    if (!latitude || !longitude) {
      return error('latitude and longitude are required', 400);
    }

    // Fetch all public points for checking
    const { data: allPoints, error: dbError } = await supabase
      .from('public_points')
      .select('latitude, longitude');

    if (dbError) {
      console.error('❌ Database error:', dbError.message);
      return error('Failed to fetch points');
    }

    const allUserPoints = allPoints || [];

    // Generate local grid points within radius
    const latDelta = radius / 111000; // ~1 degree latitude = 111km
    const lonDelta = radius / (111000 * Math.cos((latitude * Math.PI) / 180));

    const gapPoints = [];

    for (let lat = latitude - latDelta; lat <= latitude + latDelta; lat += gridResolution / 111000) {
      for (let lon = longitude - lonDelta; lon <= longitude + lonDelta; lon += gridResolution / (111000 * Math.cos((lat * Math.PI) / 180))) {
        const distToCenter = haversineDistance(latitude, longitude, lat, lon);

        if (distToCenter > radius) continue;

        let isGap = true;
        for (const point of allUserPoints) {
          const distToPoint = haversineDistance(lat, lon, point.latitude, point.longitude);
          if (distToPoint <= threshold) {
            isGap = false;
            break;
          }
        }

        if (isGap) {
          gapPoints.push({
            latitude: parseFloat(lat.toFixed(6)),
            longitude: parseFloat(lon.toFixed(6))
          });
        }
      }
    }

    // Find nearest gap
    let nearest = null;
    let minDistance = Infinity;

    gapPoints.forEach(gap => {
      const dist = haversineDistance(latitude, longitude, gap.latitude, gap.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = {
          ...gap,
          distance: parseFloat(dist.toFixed(2))
        };
      }
    });

    // Find nearby gaps (with distances)
    const nearby = gapPoints.map(gap => ({
      ...gap,
      distance: parseFloat(haversineDistance(latitude, longitude, gap.latitude, gap.longitude).toFixed(2))
    })).sort((a, b) => a.distance - b.distance);

    return success({
      success: true,
      userLocation: { latitude, longitude },
      radius,
      threshold,
      gridResolution,
      nearbyCount: nearby.length,
      nearest,
      nearby
    });

  } catch (err) {
    console.error('❌ Error:', err);
    return error('Failed to calculate gaps');
  }
};
