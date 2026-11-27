const Student = require('../models/Student');

// Diak adattar (Repository)
const studentRepository = {
  findById: async (id) => {
    return await Student.findByPk(id);
  },

  findByEmail: async (email) => {
    // Visszaadja a sort torolt allapotban is; a service vizsgalja a flaget
    return await Student.findOne({ where: { diak_email: email } });
  },

  findAll: async () => {
    return await Student.findAll({ order: [['diak_ID', 'ASC']] });
  },

  findAllActive: async () => {
    return await Student.findAll({ where: { deleted: 0 }, order: [['diak_ID', 'ASC']] });
  },

  create: async (data) => {
    return await Student.create(data);
  },

  bulkCreate: async (data, options = {}) => {
    return await Student.bulkCreate(data, options);
  },

  count: async () => {
    return await Student.count();
  },

  countActive: async () => {
    return await Student.count({ where: { deleted: 0 } });
  },

  countDeleted: async () => {
    return await Student.count({ where: { deleted: 1 } });
  },

  softDelete: async (id) => {
    return await Student.update({ deleted: 1 }, { where: { diak_ID: id } });
  }
};

module.exports = studentRepository;
