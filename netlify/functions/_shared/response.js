// Shared CORS headers for Netlify Functions

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Handle OPTIONS preflight request
const handleOptions = () => ({
  statusCode: 204,
  headers
});

// Create success response
const success = (data, statusCode = 200) => ({
  statusCode,
  headers,
  body: JSON.stringify(data)
});

// Create error response
const error = (message, statusCode = 500) => ({
  statusCode,
  headers,
  body: JSON.stringify({ success: false, error: message })
});

module.exports = { headers, handleOptions, success, error };
