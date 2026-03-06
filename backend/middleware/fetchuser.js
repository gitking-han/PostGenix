const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
  // Look for token in Header OR URL Query Parameter
  const token = req.header('auth-token') || req.query.token; 
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Keep your structure: JWT payload has `user` which has `id`
    // We ensure req.user.id is populated correctly
    req.user = { id: decoded.user.id };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = fetchuser;