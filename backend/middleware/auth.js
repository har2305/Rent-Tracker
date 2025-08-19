const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
    const decoded = jwt.verify(token, jwtSecret);
      // Check session version
      const currentSessionVersion = req.app.get('SESSION_VERSION');
      if (!decoded.sessionVersion || decoded.sessionVersion !== currentSessionVersion) {
        return res.status(401).json({ error: 'Session expired due to server restart.' });
      }
      req.user = decoded;
      next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth; 