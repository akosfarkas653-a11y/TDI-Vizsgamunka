const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const studentRepository = require('../repositories/student.repository');
const teacherRepository = require('../repositories/teacher.repository');
const adminRepository = require('../repositories/admin.repository');

// Token ellenorzese es felhasznalo letezesenek/aktivitasanak vizsgalata
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Hianyzo token!' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, role } = decoded;

    let user = null;
    if (role === 'student') {
      user = await studentRepository.findById(id);
      if (!user || user.deleted === 1) {
        return res.status(401).json({ error: 'Ervenytelen vagy torolt diak fiok!' });
      }
    } else if (role === 'teacher') {
      user = await teacherRepository.findById(id);
      if (!user || user.deleted === 1) {
        return res.status(401).json({ error: 'Ervenytelen vagy torolt tanar fiok!' });
      }
    } else if (role === 'admin') {
      user = await adminRepository.findById(id);
      if (!user) {
        return res.status(401).json({ error: 'Ervenytelen admin fiok!' });
      }
    } else {
      return res.status(401).json({ error: 'Ismeretlen szerepkor!' });
    }

    req.user = { id, role, rawUser: user };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Ervenytelen vagy lejart token!' });
  }
};

// Szerepkor ellenorzo middleware
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nincs jogosultsagod a muvelet vegrehajtasahoz!' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};
