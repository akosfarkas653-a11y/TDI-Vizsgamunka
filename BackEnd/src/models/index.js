const sequelize = require('../config/db');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Admin = require('./Admin');
const LessonStatus = require('./LessonStatus');
const Lesson = require('./Lesson');
const Notification = require('./Notification');
const Message = require('./Message');

// Modell kapcsolatok (Asszociaciok)
Teacher.hasMany(Lesson, { foreignKey: 'tanar_id' });
Lesson.belongsTo(Teacher, { foreignKey: 'tanar_id' });

Student.hasMany(Lesson, { foreignKey: 'diak_id' });
Lesson.belongsTo(Student, { foreignKey: 'diak_id' });

LessonStatus.hasMany(Lesson, { foreignKey: 'statusz_id' });
Lesson.belongsTo(LessonStatus, { foreignKey: 'statusz_id', as: 'statusz' });

Lesson.hasMany(Notification, { foreignKey: 'ora_id' });
Notification.belongsTo(Lesson, { foreignKey: 'ora_id' });

Lesson.hasMany(Message, { foreignKey: 'ora_id' });
Message.belongsTo(Lesson, { foreignKey: 'ora_id' });

// Adatbazis szinkronizalas (tablak letrehozasa/ellenorzese)
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Adatbazis kapcsolat es tablak sikeresen szinkronizalva.');
  } catch (error) {
    console.error('Hiba az adatbazis szinkronizalasakor:', error);
  }
};

const connectDB = syncDatabase;

module.exports = {
  sequelize,
  Student,
  Teacher,
  Admin,
  LessonStatus,
  Lesson,
  Notification,
  Message,
  syncDatabase,
  connectDB
};
