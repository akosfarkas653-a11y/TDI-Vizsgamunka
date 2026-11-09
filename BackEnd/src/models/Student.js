const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Diák modell definíciója
const Student = sequelize.define('Student', {
  diak_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  diak_nev: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  diak_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  diak_jelszo: {
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
  tableName: 'Student',
  timestamps: true // kezeli a createdAt es updatedAt mezoket
});

module.exports = Student;

