const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const studentRepository = require('../repositories/student.repository');
const teacherRepository = require('../repositories/teacher.repository');
const adminRepository = require('../repositories/admin.repository');

const SALT_ROUNDS = 10;

// Segedfuggveny: Email egyediseg ellenorzese mindket felhasznaloi tablaban
const checkEmailUnique = async (email) => {
  const existingStudent = await studentRepository.findByEmail(email);
  if (existingStudent) {
    throw new Error('Ez az email cim mar regisztralva van!');
  }
  const existingTeacher = await teacherRepository.findByEmail(email);
  if (existingTeacher) {
    throw new Error('Ez az email cim mar regisztralva van!');
  }
};

// Diak regisztracio (mindig diakot hoz letre)
const register = async ({ nev, email, jelszo }) => {
  if (!nev || !email || !jelszo) {
    throw new Error('Minden mezo kitoltese kotelezo (nev, email, jelszo)!');
  }

  // Egyszeru email formatum ellenorzes
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Ervenytelen email formatum!');
  }

  // Jelszo minimalis hossza
  if (jelszo.length < 6) {
    throw new Error('A jelszonak legalabb 6 karakter hosszunak kell lennie!');
  }

  // Email egyediseg ellenorzese mindket tablaban (torolt fiok is foglaltnak szamit)
  await checkEmailUnique(email);

  const hashedPassword = await bcrypt.hash(jelszo, SALT_ROUNDS);

  const student = await studentRepository.create({
    diak_nev: nev.trim(),
    diak_email: email.trim().toLowerCase(),
    diak_jelszo: hashedPassword,
    deleted: 0
  });

  return {
    id: student.diak_ID,
    nev: student.diak_nev,
    email: student.diak_email,
    role: 'student'
  };
};

// Bejelentkezes (egyetlen bejelentkezo urlap)
const login = async ({ email, jelszo }) => {
  if (!email || !jelszo) {
    throw new Error('Hibas belepesi adatok');
  }

  const identifier = email.trim();
  let foundUser = null;
  let role = null;
  let userId = null;
  let userName = null;
  let userEmail = null;
  let storedHash = null;

  if (identifier.includes('@')) {
    // Diak vagy tanar keresese
    const student = await studentRepository.findByEmail(identifier.toLowerCase());
    if (student) {
      if (student.deleted === 1) {
        throw new Error('Hibas belepesi adatok');
      }
      foundUser = student;
      role = 'student';
      userId = student.diak_ID;
      userName = student.diak_nev;
      userEmail = student.diak_email;
      storedHash = student.diak_jelszo;
    } else {
      const teacher = await teacherRepository.findByEmail(identifier.toLowerCase());
      if (teacher) {
        if (teacher.deleted === 1) {
          throw new Error('Hibas belepesi adatok');
        }
        foundUser = teacher;
        role = 'teacher';
        userId = teacher.tanar_ID;
        userName = teacher.tanar_nev;
        userEmail = teacher.tanar_email;
        storedHash = teacher.tanar_jelszo;
      }
    }
  } else {
    // Admin keresese nev alapjan
    const admin = await adminRepository.findByName(identifier);
    if (admin) {
      foundUser = admin;
      role = 'admin';
      userId = admin.admin_ID;
      userName = admin.admin_nev;
      userEmail = null;
      storedHash = admin.admin_jelszo;
    }
  }

  if (!foundUser || !storedHash) {
    throw new Error('Hibas belepesi adatok');
  }

  const passwordMatch = await bcrypt.compare(jelszo, storedHash);
  if (!passwordMatch) {
    throw new Error('Hibas belepesi adatok');
  }

  const token = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '24h' });

  return {
    token,
    user: {
      id: userId,
      nev: userName,
      email: userEmail,
      role
    }
  };
};

module.exports = {
  checkEmailUnique,
  register,
  login
};
