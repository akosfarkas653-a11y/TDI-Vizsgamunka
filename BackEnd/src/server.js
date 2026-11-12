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
const { PORT } = require('./config/config');
const { syncDatabase } = require('./models');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

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
  await syncDatabase();
});
