// GET /api/health
// Health check endpoint

const { handleOptions, success } = require('./_shared/response');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  return success({
    success: true,
    message: 'Mappar API is running',
    version: '1.0.0',
    environment: 'netlify',
    timestamp: new Date().toISOString()
  });
};
