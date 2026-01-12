// GET /api/users
// Get all users

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
    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('*');

    if (dbError) {
      console.error('❌ Database error:', dbError.message);
      return error('Failed to fetch users');
    }

    return success({
      success: true,
      count: users.length,
      data: users
    });

  } catch (err) {
    console.error('❌ Error:', err);
    return error('Failed to fetch users');
  }
};
