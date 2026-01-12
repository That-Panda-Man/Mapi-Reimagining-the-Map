// Shared Supabase admin client for Netlify Functions
// Uses service role key for full database access

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_API_KEY
);

module.exports = supabaseAdmin;
