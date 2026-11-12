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
    return await Teacher.findAll();
  },

  findAllActive: async () => {
    return await Teacher.findAll({ where: { deleted: 0 } });
  },

  create: async (data) => {
    return await Teacher.create(data);
  },

  softDelete: async (id) => {
    return await Teacher.update({ deleted: 1 }, { where: { tanar_ID: id } });
  }
};

module.exports = teacherRepository;

