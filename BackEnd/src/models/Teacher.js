const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tanár modell definíciója
const Teacher = sequelize.define('Teacher', {
  tanar_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tanar_nev: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tanar_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  tanar_jelszo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deleted: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isIn: {
        args: [[0, 1]],
        msg: 'A deleted erteke csak 0 vagy 1 lehet!'
      }
    }
  }
}, {
  tableName: 'Teacher',
  timestamps: true // kezeli a createdAt es updatedAt mezoket
});

module.exports = Teacher;

