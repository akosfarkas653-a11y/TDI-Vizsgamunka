const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Köztes rétegek (Middleware)
app.use(cors());
app.use(express.json());

// Útvonalak regisztrálása
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

// Állapot-ellenőrző végpont
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TDI Backend SQLite szerver fut' });
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`A TDI szerver elindult a http://localhost:${PORT} címen`);
});

