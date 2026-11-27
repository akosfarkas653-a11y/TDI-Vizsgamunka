const Teacher = require('../models/Teacher');

// Tanar adattar (Repository)
const teacherRepository = {
  findById: async (id) => {
    return await Teacher.findByPk(id);
  },

  findByEmail: async (email) => {
    // Visszaadja a sort torolt allapotban is; a service vizsgalja a flaget
    return await Teacher.findOne({ where: { tanar_email: email } });
  },

  findAll: async () => {
    return await Teacher.findAll({ order: [['tanar_ID', 'ASC']] });
  },

  findAllActive: async () => {
    return await Teacher.findAll({ where: { deleted: 0 }, order: [['tanar_ID', 'ASC']] });
  },

  create: async (data) => {
    return await Teacher.create(data);
  },

  bulkCreate: async (data, options = {}) => {
    return await Teacher.bulkCreate(data, options);
  },

  count: async () => {
    return await Teacher.count();
  },

  countActive: async () => {
    return await Teacher.count({ where: { deleted: 0 } });
  },

  countDeleted: async () => {
    return await Teacher.count({ where: { deleted: 1 } });
  },

  softDelete: async (id) => {
    return await Teacher.update({ deleted: 1 }, { where: { tanar_ID: id } });
  }
};

module.exports = teacherRepository;
