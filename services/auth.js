const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-clicktrade-secret';
}

function signWorkerToken(profile) {
  return jwt.sign(
    {
      sub: profile.worker_id,
      role: 'worker',
      workerId: profile.worker_id,
      email: profile.profile_email || null,
      name: profile.name || null
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function signAdminToken(identity) {
  return jwt.sign(
    {
      sub: identity,
      role: 'admin'
    },
    getJwtSecret(),
    { expiresIn: '12h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function extractBearer(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

function requireWorkerAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return res.status(401).json({ error: 'Missing auth token' });
    const decoded = verifyToken(token);
    if (decoded.role !== 'worker') return res.status(403).json({ error: 'Worker token required' });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdminAuth(req, res, next) {
  try {
    const token = extractBearer(req);
    if (!token) return res.status(401).json({ error: 'Missing auth token' });
    const decoded = verifyToken(token);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin token required' });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  signWorkerToken,
  signAdminToken,
  requireWorkerAuth,
  requireAdminAuth
};
