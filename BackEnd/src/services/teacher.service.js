const lessonRepository = require('../repositories/lesson.repository');
const notificationRepository = require('../repositories/notification.repository');
const teacherRepository = require('../repositories/teacher.repository');
const STATUS = require('../config/lessonStatus');

// Idoformazo segedfuggveny az ertesitesekhez
const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 16);
};

// Uj szabad ora meghirdetese
const createLesson = async (teacherId, { tantargy, ora_TIME }) => {
  if (!tantargy || !ora_TIME) {
    throw new Error('A tantargy es az ora idopontja (ora_TIME) kotelezo!');
  }

  const lessonDate = new Date(ora_TIME);
  if (isNaN(lessonDate.getTime())) {
    throw new Error('Ervenytelen datum vagy idopont!');
  }

  const lesson = await lessonRepository.create({
    tanar_id: teacherId,
    diak_id: null,
    tantargy: tantargy.trim(),
    ora_TIME: lessonDate,
    statusz_id: STATUS.SZABAD
  });

  return lesson;
};

// Tanar sajat orainak lekerdezese
const getLessons = async (teacherId) => {
  return await lessonRepository.findByTeacher(teacherId);
};

// Foglalt ora jovahagyasa
const approveLesson = async (teacherId, lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw new Error('A megadott ora nem talalhato!');
  }

  if (lesson.tanar_id !== teacherId) {
    throw new Error('Csak a sajat oradat hagyhatod jova!');
  }

  if (lesson.statusz_id !== STATUS.FOGLALT) {
    throw new Error('Csak foglalt allapotu ora hagyhato jova!');
  }

  const updated = await lessonRepository.update(lessonId, {
    statusz_id: STATUS.JOVAHAGYOTT
  });

  if (lesson.diak_id) {
    const teacher = await teacherRepository.findById(teacherId);
    const teacherName = teacher ? teacher.tanar_nev : 'A tanar';
    const timeStr = formatDateTime(lesson.ora_TIME);
    const notifyText = `${teacherName} jovahagyta az oradat: ${lesson.tantargy} (${timeStr}).`;

    await notificationRepository.create({
      cimzett_tipus: 'student',
      cimzett_id: lesson.diak_id,
      ora_id: lesson.ora_ID,
      szoveg: notifyText,
      olvasott: 0
    });
  }

  return updated;
};

// Ora lemondasa a tanar reszerol
const cancelLesson = async (teacherId, lessonId) => {
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw new Error('A megadott ora nem talalhato!');
  }

  if (lesson.tanar_id !== teacherId) {
    throw new Error('Csak a sajat oradat mondhatod le!');
  }

  if (lesson.statusz_id === STATUS.LEMONDVA) {
    throw new Error('Ez az ora mar le van mondva!');
  }

  await lessonRepository.update(lessonId, {
    statusz_id: STATUS.LEMONDVA
  });

  if (lesson.diak_id) {
    const teacher = await teacherRepository.findById(teacherId);
    const teacherName = teacher ? teacher.tanar_nev : 'A tanar';
    const timeStr = formatDateTime(lesson.ora_TIME);
    const notifyText = `${teacherName} lemondta az orat: ${lesson.tantargy} (${timeStr}).`;

    await notificationRepository.create({
      cimzett_tipus: 'student',
      cimzett_id: lesson.diak_id,
      ora_id: lesson.ora_ID,
      szoveg: notifyText,
      olvasott: 0
    });
  }

  return { message: 'Ora sikeresen lemondva.' };
};

// Tanari statisztika
const getStats = async (teacherId) => {
  return await lessonRepository.countByStatus(teacherId);
};

module.exports = {
  createLesson,
  getLessons,
  approveLesson,
  cancelLesson,
  getStats
};

