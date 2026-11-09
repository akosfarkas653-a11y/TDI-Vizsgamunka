const sequelize = require('../config/db');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Admin = require('./Admin');

// Modellek szinkronizálása az adatbázissal
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Adatbazis tablak sikeresen szinkronizalva (Student, Teacher, Admin).');
  } catch (error) {
    console.error('Hiba az adatbazis szinkronizalasakor:', error);
  }
};

module.exports = {
  sequelize,
  Student,
  Teacher,
  Admin,
  syncDatabase
};

