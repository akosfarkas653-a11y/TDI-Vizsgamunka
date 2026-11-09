const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Admin modell definíciója
const Admin = sequelize.define('Admin', {
  admin_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  admin_nev: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
    validate: {
      notContainsAt(value) {
        if (value && value.includes('@')) {
          throw new Error('Az admin_nev nem tartalmazhat "@" karaktert!');
        }
      }
    }
  },
  admin_jelszo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'Admin',
  timestamps: false // Az Admin tablahoz nem keszul createdAt es updatedAt
});

module.exports = Admin;

