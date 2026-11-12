const bcrypt = require('bcryptjs');
const teacherRepository = require('../repositories/teacher.repository');
const studentRepository = require('../repositories/student.repository');
const lessonRepository = require('../repositories/lesson.repository');
const notificationRepository = require('../repositories/notification.repository');
const { checkEmailUnique } = require('./auth.service');
const STATUS = require('../config/lessonStatus');

const SALT_ROUNDS = 10;

// Idoformazo segedfuggveny
const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 16);
};

// Tanar fiok letrehozasa (Admin)
const createTeacher = async ({ nev, email, jelszo }) => {
  if (!nev || !email || !jelszo) {
    throw new Error('Minden mezo kitoltese kotelezo (nev, email, jelszo)!');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Ervenytelen email formatum!');
  }

  if (jelszo.length < 6) {
    throw new Error('A jelszonak legalabb 6 karakter hosszunak kell lennie!');
  }

  await checkEmailUnique(email);

  const hashedPassword = await bcrypt.hash(jelszo, SALT_ROUNDS);

  const teacher = await teacherRepository.create({
    tanar_nev: nev.trim(),
    tanar_email: email.trim().toLowerCase(),
    tanar_jelszo: hashedPassword,
    deleted: 0
  });

  return {
    id: teacher.tanar_ID,
    nev: teacher.tanar_nev,
    email: teacher.tanar_email,
    role: 'teacher'
  };
};

// Tanarok listazasa (jelszavak nelkul)
const getTeachers = async (includeDeleted = false) => {
  const teachers = includeDeleted
    ? await teacherRepository.findAll()
    : await teacherRepository.findAllActive();

  return teachers.map((t) => ({
    tanar_ID: t.tanar_ID,
    tanar_nev: t.tanar_nev,
    tanar_email: t.tanar_email,
    deleted: t.deleted,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }));
};

// Diakok listazasa (jelszavak nelkul)
const getStudents = async (includeDeleted = false) => {
  const students = includeDeleted
    ? await studentRepository.findAll()
    : await studentRepository.findAllActive();

  return students.map((s) => ({
    diak_ID: s.diak_ID,
    diak_nev: s.diak_nev,
    diak_email: s.diak_email,
    deleted: s.deleted,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  }));
};

// Minden foglalt ora (FOGLALT es JOVAHAGYOTT)
const getBookedLessons = async () => {
  return await lessonRepository.findAllBooked();
};

// Egy tanar osszefoglaloja: statisztika es orak listaja
const getTeacherOverview = async (teacherId) => {
  const teacher = await teacherRepository.findById(teacherId);
  if (!teacher) {
    throw new Error('A megadott tanar nem talalhato!');
  }

  const stats = await lessonRepository.countByStatus(teacherId);
  const lessons = await lessonRepository.findByTeacher(teacherId);

  return {
    teacher: {
      tanar_ID: teacher.tanar_ID,
      tanar_nev: teacher.tanar_nev,
      tanar_email: teacher.tanar_email,
      deleted: teacher.deleted
    },
    stats,
    lessons
  };
};

// Egy diak osszefoglaloja: statisztika es foglalt orak listaja
const getStudentOverview = async (studentId) => {
  const student = await studentRepository.findById(studentId);
  if (!student) {
    throw new Error('A megadott diak nem talalhato!');
  }

  const stats = await lessonRepository.countByStudentStatus(studentId);
  const lessons = await lessonRepository.findByStudent(studentId);

  return {
    student: {
      diak_ID: student.diak_ID,
      diak_nev: student.diak_nev,
      diak_email: student.diak_email,
      deleted: student.deleted
    },
    stats,
    lessons
  };
};

// Tanar soft delete
const deleteTeacher = async (teacherId) => {
  const teacher = await teacherRepository.findById(teacherId);
  if (!teacher) {
    throw new Error('A megadott tanar nem talalhato!');
  }

  // Tanarhoz tartozo aktiv orak lekerdezese
  const activeLessons = await lessonRepository.findActiveByTeacher(teacherId);
  const teacherName = teacher.tanar_nev;

  for (const lesson of activeLessons) {
    // Minden aktiv ora lemondva allapotba kerul
    await lessonRepository.update(lesson.ora_ID, {
      statusz_id: STATUS.LEMONDVA
    });

    // Ha volt foglalo diak, ertesitest kap
    if (lesson.diak_id) {
      const timeStr = formatDateTime(lesson.ora_TIME);
      const notifyText = `${teacherName} tanar fiokja torlesre kerult, igy az ora lemondasra kerult: ${lesson.tantargy} (${timeStr}).`;

      await notificationRepository.create({
        cimzett_tipus: 'student',
        cimzett_id: lesson.diak_id,
        ora_id: lesson.ora_ID,
        szoveg: notifyText,
        olvasott: 0
      });
    }
  }

  await teacherRepository.softDelete(teacherId);

  return { message: 'Tanar fiok sikeresen inaktivalva (soft delete).' };
};

// Diak soft delete (Admin altal)
const deleteStudent = async (studentId) => {
  const student = await studentRepository.findById(studentId);
  if (!student) {
    throw new Error('A megadott diak nem talalhato!');
  }

  const activeLessons = await lessonRepository.findActiveByStudent(studentId);
  const studentName = student.diak_nev;

  for (const lesson of activeLessons) {
    await lessonRepository.update(lesson.ora_ID, {
      diak_id: null,
      statusz_id: STATUS.SZABAD
    });

    const timeStr = formatDateTime(lesson.ora_TIME);
    const notifyText = `${studentName} diak fiokja torlesre kerult, igy a foglalasa torolve lett: ${lesson.tantargy} (${timeStr}). Az ora felszabadult.`;

    await notificationRepository.create({
      cimzett_tipus: 'teacher',
      cimzett_id: lesson.tanar_id,
      ora_id: lesson.ora_ID,
      szoveg: notifyText,
      olvasott: 0
    });
  }

  await studentRepository.softDelete(studentId);

  return { message: 'Diak fiok sikeresen inaktivalva (soft delete).' };
};

module.exports = {
  createTeacher,
  getTeachers,
  getStudents,
  getBookedLessons,
  getTeacherOverview,
  getStudentOverview,
  deleteTeacher,
  deleteStudent
};

