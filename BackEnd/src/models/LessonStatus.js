const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// OraStatusz modell definicioja (fix statuszok)
const LessonStatus = sequelize.define('LessonStatus', {
  statusz_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  statusz_nev: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'OraStatusz',
  timestamps: false
});

module.exports = LessonStatus;

