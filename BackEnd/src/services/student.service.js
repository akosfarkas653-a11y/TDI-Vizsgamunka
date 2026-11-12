const lessonRepository = require('../repositories/lesson.repository');
const notificationRepository = require('../repositories/notification.repository');
const studentRepository = require('../repositories/student.repository');
const STATUS = require('../config/lessonStatus');

// Idoformazo segedfuggveny az ertesitesekhez
const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 16);
};

// Szabad orak lekerdezese tanar es tantargy szurokkel
const getFreeLessons = async ({ teacher, subject }) => {
  return await lessonRepository.findFreeLessons({ teacherName: teacher, subject });
};

// Ora lefoglalasa
const bookLesson = async (studentId, lessonId) => {
  if (!lessonId) {
    throw new Error('Az ora azonositoja (lessonId) kotelezo!');
  }

  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw new Error('A megadott ora nem talalhato!');
  }

  if (lesson.statusz_id !== STATUS.SZABAD) {
    throw new Error('Ez az ora mar nem szabad, nem foglalhato!');
  }

  const updatedLesson = await lessonRepository.update(lessonId, {
    diak_id: studentId,
    statusz_id: STATUS.FOGLALT
  });

  const student = await studentRepository.findById(studentId);
  const studentName = student ? student.diak_nev : 'Egy diak';
  const timeStr = formatDateTime(lesson.ora_TIME);
  const notifyText = `${studentName} lefoglalta az orat: ${lesson.tantargy} (${timeStr}).`;

  await notificationRepository.create({
    cimzett_tipus: 'teacher',
    cimzett_id: lesson.tanar_id,
    ora_id: lesson.ora_ID,
    szoveg: notifyText,
    olvasott: 0
  });

  return updatedLesson;
};

// Diak sajat orai
const getMyBookings = async (studentId) => {
  return await lessonRepository.findByStudent(studentId);
};

// Foglalas lemondasa a diak reszerol
const cancelBooking = async (studentId, lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw new Error('A megadott ora nem talalhato!');
  }

  if (lesson.diak_id !== studentId) {
    throw new Error('Csak a sajat foglalasodat mondhatod le!');
  }

  if (lesson.statusz_id !== STATUS.FOGLALT && lesson.statusz_id !== STATUS.JOVAHAGYOTT) {
    throw new Error('Csak foglalt vagy jovahagyott ora mondhato le!');
  }

  await lessonRepository.update(lessonId, {
    diak_id: null,
    statusz_id: STATUS.SZABAD
  });

  const student = await studentRepository.findById(studentId);
  const studentName = student ? student.diak_nev : 'A diak';
  const timeStr = formatDateTime(lesson.ora_TIME);
  const notifyText = `${studentName} lemondta a foglalasat: ${lesson.tantargy} (${timeStr}).`;

  await notificationRepository.create({
    cimzett_tipus: 'teacher',
    cimzett_id: lesson.tanar_id,
    ora_id: lesson.ora_ID,
    szoveg: notifyText,
    olvasott: 0
  });

  return { message: 'Foglalas sikeresen lemondva, az ora ujra szabad.' };
};

// Diak profil soft delete
const deleteProfile = async (studentId) => {
  const student = await studentRepository.findById(studentId);
  if (!student) {
    throw new Error('A diak nem talalhato!');
  }

  const activeLessons = await lessonRepository.findActiveByStudent(studentId);
  const studentName = student.diak_nev;

  for (const lesson of activeLessons) {
    await lessonRepository.update(lesson.ora_ID, {
      diak_id: null,
      statusz_id: STATUS.SZABAD
    });

    const timeStr = formatDateTime(lesson.ora_TIME);
    const notifyText = `${studentName} torolte a profiljat, igy a foglalasa torolve lett: ${lesson.tantargy} (${timeStr}). Az ora felszabadult.`;

    await notificationRepository.create({
      cimzett_tipus: 'teacher',
      cimzett_id: lesson.tanar_id,
      ora_id: lesson.ora_ID,
      szoveg: notifyText,
      olvasott: 0
    });
  }

  await studentRepository.softDelete(studentId);

  return { message: 'A diak profil sikeresen inaktivalva (soft delete).' };
};

module.exports = {
  getFreeLessons,
  bookLesson,
  getMyBookings,
  cancelBooking,
  deleteProfile
};

