// GET /api/public-points - Get all public points
// POST /api/public-points - Add a new public point

const supabase = require('./_shared/supabase');
const { handleOptions, success, error } = require('./_shared/response');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // GET - Fetch all public points
    if (event.httpMethod === 'GET') {
      const { data: points, error: dbError } = await supabase
        .from('public_points')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('❌ Database error:', dbError.message);
        return error('Failed to fetch public points');
      }

      return success({
        success: true,
        count: points.length,
        data: points
      });
    }

    // POST - Add a new public point
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { latitude, longitude, description, icon_name, submitted_by, expiry_date } = body;

      console.log('📍 POST /api/public-points received');
      console.log('Request body:', JSON.stringify(body, null, 2));

      // Validate required fields
      if (!latitude || !longitude || !description || !icon_name) {
        console.log('❌ Validation failed: Missing required fields');
        return error('latitude, longitude, description, and icon_name are required', 400);
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        console.log('❌ Validation failed: Invalid coordinates');
        return error('Invalid coordinates', 400);
      }

      // Insert new public point
      console.log('📝 Adding new public point to database...');

      const { data: newPoint, error: insertError } = await supabase
        .from('public_points')
        .insert({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description: description.trim(),
          icon_name: icon_name.trim(),
          submitted_by: submitted_by || 'Anonymous',
          expiry_date: expiry_date || null
        })
        .select();

      if (insertError) {
        console.error('❌ Database error:', insertError.message);
        return error('Failed to add public point');
      }

      console.log(`✓ Public point added: "${description}"`);

      return success({
        success: true,
        message: 'Public point added successfully',
        data: newPoint[0]
      }, 201);
    }

    // Method not allowed
    return error('Method not allowed', 405);

  } catch (err) {
    console.error('❌ Error:', err);
    return error('Internal server error');
  }
};
