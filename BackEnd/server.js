// Kornyezeti valtozok betoltese
try {
  require('dotenv').config();
} catch (e) {
  if (process.loadEnvFile) {
    try {
      process.loadEnvFile();
    } catch (_) { }
  }
}

const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config/config');
const { connectDB } = require('./src/models');

const { checkEmptyTable: checkEmptyStatusTable } = require('./src/z_dummy_data/lessonStatus_dummy');
const { checkEmptyTable: checkEmptyAdminTable } = require('./src/z_dummy_data/admin_dummy');
const { checkEmptyTable: checkEmptyTeachersTable } = require('./src/z_dummy_data/teachers_dummy');
const { checkEmptyTable: checkEmptyStudentsTable } = require('./src/z_dummy_data/students_dummy');
const { checkEmptyTable: checkEmptyLessonsTable } = require('./src/z_dummy_data/lessons_dummy');
const { checkEmptyTable: checkEmptyMessagesTable } = require('./src/z_dummy_data/messages_dummy');

const authRoutes = require('./src/routes/auth.routes');
const studentRoutes = require('./src/routes/student.routes');
const teacherRoutes = require('./src/routes/teacher.routes');
const adminRoutes = require('./src/routes/admin.routes');
const notificationRoutes = require('./src/routes/notification.routes');

const app = express();

// Koztes retegek (Middleware)
app.use(cors());
app.use(express.json());

// Utvonalak regisztralasa
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Allapot-ellenorzo vegpont
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TDI Backend szerver fut' });
});

// Szerver inditasa es adatbazis szinkronizalasa
app.listen(PORT, async () => {
  console.log(`A TDI szerver elindult a http://localhost:${PORT} cimen`);
  await connectDB();
  await checkEmptyStatusTable();
  await checkEmptyAdminTable();
  await checkEmptyTeachersTable();
  await checkEmptyStudentsTable();
  await checkEmptyLessonsTable();
  await checkEmptyMessagesTable();
});
