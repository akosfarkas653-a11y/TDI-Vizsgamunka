const jwt = require('jsonwebtoken');

// Token ellenőrzése
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Hozzáférés megtagadva: Hiányzó token' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Érvénytelen vagy lejárt token' });
    }
    req.user = user;
    next();
  });
};

// Szerepkör ellenőrző middleware készítő
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Nincs jogosultságod ehhez a művelethez' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};

