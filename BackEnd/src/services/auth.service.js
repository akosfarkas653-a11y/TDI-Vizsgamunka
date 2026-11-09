const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, Teacher, Admin } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'tdi_secret_key_2026';
const SALT_ROUNDS = 10;

// Jelszó hashelése
const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

// Jelszó ellenőrzése
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// JWT token generálása
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Diák regisztráció
const registerStudent = async ({ nev, email, jelszo }) => {
  const existing = await Student.findOne({ where: { diak_email: email } });
  if (existing) {
    throw new Error('Ezzel az email cimmel mar letezik diak fiok!');
  }

  const hashedPassword = await hashPassword(jelszo);

  const student = await Student.create({
    diak_nev: nev,
    diak_email: email,
    diak_jelszo: hashedPassword,
    deleted: 0
  });

  return {
    id: student.diak_ID,
    nev: student.diak_nev,
    email: student.diak_email
  };
};

// Tanár létrehozása (Admin által)
const createTeacher = async ({ nev, email, jelszo }) => {
  const existing = await Teacher.findOne({ where: { tanar_email: email } });
  if (existing) {
    throw new Error('Ezzel az email cimmel mar letezik tanar fiok!');
  }

  const hashedPassword = await hashPassword(jelszo);

  const teacher = await Teacher.create({
    tanar_nev: nev,
    tanar_email: email,
    tanar_jelszo: hashedPassword,
    deleted: 0
  });

  return {
    id: teacher.tanar_ID,
    nev: teacher.tanar_nev,
    email: teacher.tanar_email
  };
};

// Bejelentkezés kezelése szerepkör alapján
const login = async ({ role, azonosito, jelszo }) => {
  // role: 'student' | 'teacher' | 'admin'
  let user = null;
  let userId = null;
  let userName = null;
  let userEmail = null;

  if (role === 'student') {
    user = await Student.findOne({ where: { diak_email: azonosito, deleted: 0 } });
    if (!user) {
      throw new Error('Hibas email cim vagy a fiok inaktiv!');
    }
    const isValid = await verifyPassword(jelszo, user.diak_jelszo);
    if (!isValid) {
      throw new Error('Hibas jelszo!');
    }
    userId = user.diak_ID;
    userName = user.diak_nev;
    userEmail = user.diak_email;

  } else if (role === 'teacher') {
    user = await Teacher.findOne({ where: { tanar_email: azonosito, deleted: 0 } });
    if (!user) {
      throw new Error('Hibas email cim vagy a fiok inaktiv!');
    }
    const isValid = await verifyPassword(jelszo, user.tanar_jelszo);
    if (!isValid) {
      throw new Error('Hibas jelszo!');
    }
    userId = user.tanar_ID;
    userName = user.tanar_nev;
    userEmail = user.tanar_email;

  } else if (role === 'admin') {
    // Admin azonosito a nev (nem tartalmazhat '@'-ot)
    user = await Admin.findOne({ where: { admin_nev: azonosito } });
    if (!user) {
      throw new Error('Hibas adminisztratori felhasznalonev!');
    }
    const isValid = await verifyPassword(jelszo, user.admin_jelszo);
    if (!isValid) {
      throw new Error('Hibas jelszo!');
    }
    userId = user.admin_ID;
    userName = user.admin_nev;
    userEmail = null;

  } else {
    throw new Error('Ervenytelen szerepkor!');
  }

  const tokenPayload = {
    id: userId,
    nev: userName,
    email: userEmail,
    role: role
  };

  const token = generateToken(tokenPayload);

  return {
    token,
    user: tokenPayload
  };
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  registerStudent,
  createTeacher,
  login
};

