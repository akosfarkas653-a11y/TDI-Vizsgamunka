const lessonRepository = require('../repositories/lesson.repository');
const messageRepository = require('../repositories/message.repository');
const notificationRepository = require('../repositories/notification.repository');
const teacherRepository = require('../repositories/teacher.repository');
const studentRepository = require('../repositories/student.repository');
const STATUS = require('../config/lessonStatus');

// Idoformazo segedfuggveny az ertesitesekhez
const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 16);
};

// Hibakeszito segedfuggveny numerikus statuszkoddal
const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Uzenet kuldese egy adott orahoz
const sendMessage = async (role, userId, { lessonId, szoveg } = {}) => {
  // 1. Validacio: lessonId es szoveg kotelezo, szoveg hossza 1-500 karakter
  if (!lessonId || typeof szoveg !== 'string') {
    throw createError('A lessonId es a szoveg megadasa kotelezo!', 400);
  }
  const trimmedText = szoveg.trim();
  if (trimmedText.length < 1 || trimmedText.length > 500) {
    throw createError('Az uzenet hossza 1 es 500 karakter kozott lehet!', 400);
  }

  // 2. Ora letezese
  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw createError('A megadott ora nem talalhato!', 404);
  }

  // 3. Resztvevo jogosultsag ellenorzese
  if (role === 'student') {
    if (lesson.diak_id !== userId) {
      throw createError('Ehhez az orahoz nincs jogosultsagod!', 403);
    }
  } else if (role === 'teacher') {
    if (lesson.tanar_id !== userId) {
      throw createError('Ehhez az orahoz nincs jogosultsagod!', 403);
    }
  } else {
    throw createError('Ismeretlen szerepkor!', 403);
  }

  // 4. Ora statuszanak ellenorzese (csak FOGLALT vagy JOVAHAGYOTT lehet)
  if (lesson.statusz_id !== STATUS.FOGLALT && lesson.statusz_id !== STATUS.JOVAHAGYOTT) {
    throw createError('Ehhez az orahoz mar nem kuldheto uzenet.', 400);
  }

  // 5. Cimzett meghatarozasa es inaktivitasanak ellenorzese
  let cimzettTipus = null;
  let cimzettId = null;
  let feladoNev = '';

  if (role === 'student') {
    cimzettTipus = 'teacher';
    cimzettId = lesson.tanar_id;
    const teacher = lesson.Teacher || await teacherRepository.findById(lesson.tanar_id);
    if (!teacher || teacher.deleted === 1) {
      throw createError('A cimzett felhasznalo fiokja inaktiv!', 400);
    }
    feladoNev = lesson.Student ? lesson.Student.diak_nev : (await studentRepository.findById(userId))?.diak_nev || 'Egy diak';
  } else {
    cimzettTipus = 'student';
    cimzettId = lesson.diak_id;
    const student = lesson.Student || await studentRepository.findById(lesson.diak_id);
    if (!student || student.deleted === 1) {
      throw createError('A cimzett felhasznalo fiokja inaktiv!', 400);
    }
    feladoNev = lesson.Teacher ? lesson.Teacher.tanar_nev : (await teacherRepository.findById(userId))?.tanar_nev || 'A tanar';
  }

  // 6. Uzenet mentese
  const message = await messageRepository.create({
    ora_id: lesson.ora_ID,
    felado_tipus: role,
    felado_id: userId,
    cimzett_tipus: cimzettTipus,
    cimzett_id: cimzettId,
    szoveg: trimmedText
  });

  // 7. Ertesites letrehozasa a cimzett szamara
  const timeStr = formatDateTime(lesson.ora_TIME);
  const notifyText = `Uj uzeneted erkezett ${feladoNev} felhasznalotol: ${lesson.tantargy} (${timeStr}).`;

  await notificationRepository.create({
    cimzett_tipus: cimzettTipus,
    cimzett_id: cimzettId,
    ora_id: lesson.ora_ID,
    szoveg: notifyText,
    olvasott: 0
  });

  // 8. Visszateresi ertek
  return {
    uzenet_ID: message.uzenet_ID,
    ora_id: message.ora_id,
    felado_tipus: message.felado_tipus,
    felado_nev: feladoNev,
    szoveg: message.szoveg,
    createdAt: message.createdAt,
    sajat: true
  };
};

// Egy ora beszelgetesfolyamanak lekerdezese
const getThread = async (role, userId, lessonId) => {
  if (!lessonId) {
    throw createError('A lessonId megadasa kotelezo!', 400);
  }

  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    throw createError('A megadott ora nem talalhato!', 404);
  }

  // Resztvevo jogosultsag ellenorzese
  if (role === 'student') {
    if (lesson.diak_id !== userId) {
      throw createError('Ehhez az orahoz nincs jogosultsagod!', 403);
    }
  } else if (role === 'teacher') {
    if (lesson.tanar_id !== userId) {
      throw createError('Ehhez az orahoz nincs jogosultsagod!', 403);
    }
  } else {
    throw createError('Ismeretlen szerepkor!', 403);
  }

  const teacherName = lesson.Teacher ? lesson.Teacher.tanar_nev : null;
  const statuszNev = lesson.statusz ? lesson.statusz.statusz_nev : null;

  // Ha nincs diak hozzarendelve (pl. szabad ora)
  if (!lesson.diak_id) {
    return {
      lesson: {
        ora_ID: lesson.ora_ID,
        tantargy: lesson.tantargy,
        ora_TIME: lesson.ora_TIME,
        statusz_nev: statuszNev,
        partner_nev: null
      },
      messages: []
    };
  }

  const studentName = lesson.Student ? lesson.Student.diak_nev : null;
  const partnerNev = role === 'student' ? teacherName : studentName;

  // Adatvedelmi szabaly: CSAK a jelenlegi diak uzeneteit kerdezzuk le
  const rawMessages = await messageRepository.findByLessonAndStudent(lesson.ora_ID, lesson.diak_id);

  const mappedMessages = rawMessages.map((m) => {
    const isSenderStudent = m.felado_tipus === 'student';
    const senderName = isSenderStudent ? studentName : teacherName;
    const isSajat = m.felado_tipus === role && m.felado_id === userId;

    return {
      uzenet_ID: m.uzenet_ID,
      felado_tipus: m.felado_tipus,
      felado_nev: senderName,
      szoveg: m.szoveg,
      createdAt: m.createdAt,
      sajat: isSajat
    };
  });

  return {
    lesson: {
      ora_ID: lesson.ora_ID,
      tantargy: lesson.tantargy,
      ora_TIME: lesson.ora_TIME,
      statusz_nev: statuszNev,
      partner_nev: partnerNev
    },
    messages: mappedMessages
  };
};

module.exports = {
  sendMessage,
  getThread
};
