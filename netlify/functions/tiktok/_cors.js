const allowOrigin = process.env.CORS_ALLOW_ORIGIN || "*";

exports.headers = {
  "Access-Control-Allow-Origin": allowOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

exports.preflight = () => ({
  statusCode: 204,
  headers: exports.headers,
  body: ""
});