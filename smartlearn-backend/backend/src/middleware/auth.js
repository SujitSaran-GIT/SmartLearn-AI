import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;

    // Add token expiration time for frontend monitoring
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;

    // If token expires in less than 2 minutes, add header for frontend
    if (timeUntilExpiry < 120) {
      res.setHeader('X-Token-Refresh-Soon', 'true');
      res.setHeader('X-Token-Expires-In', timeUntilExpiry.toString());
    }

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Access token expired, please refresh',
        code: 'TOKEN_EXPIRED',
        requiresRefresh: true
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

// Optional authentication middleware for routes where auth is optional
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
  } catch (err) {
    // Token is invalid but we continue without user
    req.user = null;
    req.userId = null;
  }

  next();
};