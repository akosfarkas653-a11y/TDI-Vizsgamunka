const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Uzenetek modell definicioja
const Message = sequelize.define('Message', {
  uzenet_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ora_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  felado_tipus: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['student', 'teacher']],
        msg: 'A felado_tipus csak "student" vagy "teacher" lehet!'
      }
    }
  },
  felado_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cimzett_tipus: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: {
        args: [['student', 'teacher']],
        msg: 'A cimzett_tipus csak "student" vagy "teacher" lehet!'
      }
    }
  },
  cimzett_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  szoveg: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [1, 500],
        msg: 'Az uzenet hossza 1 es 500 karakter kozott lehet!'
      }
    }
  }
}, {
  tableName: 'Uzenetek',
  timestamps: true,
  updatedAt: false
});

module.exports = Message;
