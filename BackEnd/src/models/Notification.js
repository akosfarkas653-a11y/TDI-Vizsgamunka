const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Notifications modell definicioja
const Notification = sequelize.define('Notification', {
  notif_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  ora_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  szoveg: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  olvasott: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'Notifications',
  timestamps: true,
  updatedAt: false
});

module.exports = Notification;

