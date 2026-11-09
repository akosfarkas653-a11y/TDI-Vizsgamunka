const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite adatbázis kapcsolat beállítása
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false // Tiszta konzol kimenet
});

module.exports = sequelize;
