const sequelize = require('../config/db');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Admin = require('./Admin');
const LessonStatus = require('./LessonStatus');
const Lesson = require('./Lesson');
const Notification = require('./Notification');

// Modell kapcsolatok (Asszociaciok)
Teacher.hasMany(Lesson, { foreignKey: 'tanar_id' });
Lesson.belongsTo(Teacher, { foreignKey: 'tanar_id' });

Student.hasMany(Lesson, { foreignKey: 'diak_id' });
Lesson.belongsTo(Student, { foreignKey: 'diak_id' });

LessonStatus.hasMany(Lesson, { foreignKey: 'statusz_id' });
Lesson.belongsTo(LessonStatus, { foreignKey: 'statusz_id', as: 'statusz' });

Lesson.hasMany(Notification, { foreignKey: 'ora_id' });
Notification.belongsTo(Lesson, { foreignKey: 'ora_id' });

// Adatbazis szinkronizalas a kert sorrendben:
// 1. sequelize.sync(), 2. statuszok feltoltese, 3. admin seed
const syncDatabase = async () => {
  try {
    await sequelize.sync();

    // Statuszok es admin seed betoltese a repository-kon keresztul
    const lessonStatusRepository = require('../repositories/lessonStatus.repository');
    const seedAdmin = require('../seed/seedAdmin');

    await lessonStatusRepository.seedAll();
    await seedAdmin();

    console.log('Adatbazis tablak es alapadatok sikeresen szinkronizalva.');
  } catch (error) {
    console.error('Hiba az adatbazis szinkronizalasakor:', error);
  }
};

module.exports = {
  sequelize,
  Student,
  Teacher,
  Admin,
  LessonStatus,
  Lesson,
  Notification,
  syncDatabase
};
