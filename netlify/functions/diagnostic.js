// GET /api/diagnostic/tables
// Check if database tables exist (for debugging)

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

  console.log('🔍 Diagnostic check: Database tables');

  try {
    // Try direct query on users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✓ Users table exists');
    }

    // Try direct query on public_points table
    const { data: publicPointsData, error: publicPointsError } = await supabase
      .from('public_points')
      .select('id', { count: 'exact', head: true });

    if (publicPointsError) {
      console.error('❌ Public_points table error:', publicPointsError.message);
    } else {
      console.log('✓ Public_points table exists');
    }

    return success({
      success: true,
      tables: {
        users: {
          exists: !usersError,
          error: usersError?.message || null
        },
        public_points: {
          exists: !publicPointsError,
          error: publicPointsError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Diagnostic error:', err.message);
    return error(err.message);
  }
};
