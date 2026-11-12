const Admin = require('../models/Admin');

// Admin adattar (Repository)
const adminRepository = {
  findByName: async (name) => {
    return await Admin.findOne({ where: { admin_nev: name } });
  },

  findById: async (id) => {
    return await Admin.findByPk(id);
  },

  create: async (data) => {
    return await Admin.create(data);
  }
};

module.exports = adminRepository;

