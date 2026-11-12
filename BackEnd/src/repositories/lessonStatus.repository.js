const LessonStatus = require('../models/LessonStatus');
const STATUS = require('../config/lessonStatus');

// OraStatusz adattar (Repository)
const lessonStatusRepository = {
  // A 4 alapertelmezett statusz letrehozasa ha meg nem leteznek
  seedAll: async () => {
    const defaultStatuses = [
      { statusz_ID: STATUS.SZABAD, statusz_nev: 'szabad' },
      { statusz_ID: STATUS.FOGLALT, statusz_nev: 'foglalt' },
      { statusz_ID: STATUS.JOVAHAGYOTT, statusz_nev: 'jovahagyott' },
      { statusz_ID: STATUS.LEMONDVA, statusz_nev: 'lemondva' }
    ];

    for (const s of defaultStatuses) {
      await LessonStatus.findOrCreate({
        where: { statusz_ID: s.statusz_ID },
        defaults: s
      });
    }
  },

  findAll: async () => {
    return await LessonStatus.findAll();
  },

  findById: async (id) => {
    return await LessonStatus.findByPk(id);
  }
};

module.exports = lessonStatusRepository;

