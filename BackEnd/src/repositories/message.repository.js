const { Op } = require('sequelize');
const Message = require('../models/Message');

// Uzenetek adattar (Repository)
const messageRepository = {
  create: async (data) => {
    return await Message.create(data);
  },

  // Egy adott ora es diak uzeneteinek lekerdezese idorendben
  findByLessonAndStudent: async (lessonId, studentId) => {
    return await Message.findAll({
      where: {
        ora_id: lessonId,
        [Op.or]: [
          {
            felado_tipus: 'student',
            felado_id: studentId
          },
          {
            cimzett_tipus: 'student',
            cimzett_id: studentId
          }
        ]
      },
      order: [
        ['createdAt', 'ASC'],
        ['uzenet_ID', 'ASC']
      ]
    });
  },

  count: async () => {
    return await Message.count();
  },

  bulkCreate: async (data, options = {}) => {
    return await Message.bulkCreate(data, options);
  }
};

module.exports = messageRepository;
