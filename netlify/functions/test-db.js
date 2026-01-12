// GET /api/test-db
// Test database connection

const supabase = require('./_shared/supabase');
const { handleOptions, success, error } = require('./_shared/response');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return error('Method not allowed', 405);
  }

  try {
    console.log('🔍 Testing database connection...');

    const { data, error: dbError } = await supabase
      .from('public_points')
      .select('id')
      .limit(1);

    if (dbError) {
      console.error('❌ Database error:', dbError.message);
      return error(dbError.message);
    }

    console.log('✓ Database connection successful');

    return success({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Error:', err);
    return error('Database connection failed');
  }
};
