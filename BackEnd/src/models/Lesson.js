const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Orak modell definicioja
const Lesson = sequelize.define('Lesson', {
  ora_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tanar_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  diak_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tantargy: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ora_TIME: {
    type: DataTypes.DATE,
    allowNull: false
  },
  statusz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'Orak',
  timestamps: true
});

module.exports = Lesson;

