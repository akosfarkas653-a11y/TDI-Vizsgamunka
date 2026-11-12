const { Op } = require('sequelize');
const Lesson = require('../models/Lesson');
const LessonStatus = require('../models/LessonStatus');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const STATUS = require('../config/lessonStatus');

// Orak adattar (Repository)
const lessonRepository = {
  create: async (data) => {
    return await Lesson.create(data);
  },

  findById: async (id) => {
    return await Lesson.findByPk(id, {
      include: [
        { model: Teacher, attributes: ['tanar_ID', 'tanar_nev', 'tanar_email'] },
        { model: Student, attributes: ['diak_ID', 'diak_nev', 'diak_email'] },
        { model: LessonStatus, as: 'statusz', attributes: ['statusz_ID', 'statusz_nev'] }
      ]
    });
  },

  update: async (id, fields) => {
    await Lesson.update(fields, { where: { ora_ID: id } });
    return await lessonRepository.findById(id);
  },

  // Szabad orak keresese (tanar es tantargy szurokkel)
  findFreeLessons: async ({ teacherName, subject } = {}) => {
    const where = { statusz_id: STATUS.SZABAD };
    if (subject) {
      where.tantargy = { [Op.like]: `%${subject}%` };
    }

    const teacherWhere = { deleted: 0 };
    if (teacherName) {
      teacherWhere.tanar_nev = { [Op.like]: `%${teacherName}%` };
    }

    return await Lesson.findAll({
      where,
      include: [
        {
          model: Teacher,
          where: teacherWhere,
          attributes: ['tanar_ID', 'tanar_nev', 'tanar_email']
        },
        {
          model: LessonStatus,
          as: 'statusz',
          attributes: ['statusz_ID', 'statusz_nev']
        }
      ],
      order: [['ora_TIME', 'ASC']]
    });
  },

  // Tanar sajat orai
  findByTeacher: async (tanarId) => {
    return await Lesson.findAll({
      where: { tanar_id: tanarId },
      include: [
        {
          model: Student,
          attributes: ['diak_ID', 'diak_nev', 'diak_email']
        },
        {
          model: LessonStatus,
          as: 'statusz',
          attributes: ['statusz_ID', 'statusz_nev']
        }
      ],
      order: [['ora_TIME', 'ASC']]
    });
  },

  // Diak sajat orai
  findByStudent: async (diakId) => {
    return await Lesson.findAll({
      where: { diak_id: diakId },
      include: [
        {
          model: Teacher,
          attributes: ['tanar_ID', 'tanar_nev', 'tanar_email']
        },
        {
          model: LessonStatus,
          as: 'statusz',
          attributes: ['statusz_ID', 'statusz_nev']
        }
      ],
      order: [['ora_TIME', 'ASC']]
    });
  },

  // Osszes foglalt ora (admin szamara: FOGLALT es JOVAHAGYOTT)
  findAllBooked: async () => {
    return await Lesson.findAll({
      where: {
        statusz_id: { [Op.in]: [STATUS.FOGLALT, STATUS.JOVAHAGYOTT] }
      },
      include: [
        {
          model: Teacher,
          attributes: ['tanar_ID', 'tanar_nev', 'tanar_email']
        },
        {
          model: Student,
          attributes: ['diak_ID', 'diak_nev', 'diak_email']
        },
        {
          model: LessonStatus,
          as: 'statusz',
          attributes: ['statusz_ID', 'statusz_nev']
        }
      ],
      order: [['ora_TIME', 'ASC']]
    });
  },

  // Statuszok szerinti statisztika tanarra
  countByStatus: async (tanarId) => {
    const total = await Lesson.count({ where: { tanar_id: tanarId } });
    const szabad = await Lesson.count({ where: { tanar_id: tanarId, statusz_id: STATUS.SZABAD } });
    const foglalt = await Lesson.count({ where: { tanar_id: tanarId, statusz_id: STATUS.FOGLALT } });
    const jovahagyott = await Lesson.count({ where: { tanar_id: tanarId, statusz_id: STATUS.JOVAHAGYOTT } });
    const lemondva = await Lesson.count({ where: { tanar_id: tanarId, statusz_id: STATUS.LEMONDVA } });

    return { total, szabad, foglalt, jovahagyott, lemondva };
  },

  // Statuszok szerinti statisztika diakra
  countByStudentStatus: async (diakId) => {
    const total = await Lesson.count({ where: { diak_id: diakId } });
    const foglalt = await Lesson.count({ where: { diak_id: diakId, statusz_id: STATUS.FOGLALT } });
    const jovahagyott = await Lesson.count({ where: { diak_id: diakId, statusz_id: STATUS.JOVAHAGYOTT } });
    const lemondva = await Lesson.count({ where: { diak_id: diakId, statusz_id: STATUS.LEMONDVA } });

    return { total, foglalt, jovahagyott, lemondva };
  },

  // Diak aktiv orai (FOGLALT vagy JOVAHAGYOTT)
  findActiveByStudent: async (diakId) => {
    return await Lesson.findAll({
      where: {
        diak_id: diakId,
        statusz_id: { [Op.in]: [STATUS.FOGLALT, STATUS.JOVAHAGYOTT] }
      },
      include: [
        { model: Teacher, attributes: ['tanar_ID', 'tanar_nev', 'tanar_email'] },
        { model: LessonStatus, as: 'statusz', attributes: ['statusz_ID', 'statusz_nev'] }
      ]
    });
  },

  // Tanar aktiv orai (SZABAD, FOGLALT vagy JOVAHAGYOTT)
  findActiveByTeacher: async (tanarId) => {
    return await Lesson.findAll({
      where: {
        tanar_id: tanarId,
        statusz_id: { [Op.in]: [STATUS.SZABAD, STATUS.FOGLALT, STATUS.JOVAHAGYOTT] }
      },
      include: [
        { model: Student, attributes: ['diak_ID', 'diak_nev', 'diak_email'] },
        { model: LessonStatus, as: 'statusz', attributes: ['statusz_ID', 'statusz_nev'] }
      ]
    });
  }
};

module.exports = lessonRepository;

