// api/index.js
import app from '../app.js';

// Patch Express app into a handler
export default function handler(req, res) {
  return app(req, res);
}
