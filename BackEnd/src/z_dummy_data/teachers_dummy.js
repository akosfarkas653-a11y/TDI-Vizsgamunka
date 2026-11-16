// Tanar tesztadatok (jelszo nyilt szovegkent: 'password123')
const bcrypt = require('bcryptjs');
const teacherRepository = require('../repositories/teacher.repository');

const dummyTeachers = [
  {
    tanar_nev: 'Kovács István',
    tanar_email: 'kovacs.istvan@example.com',
    tanar_jelszo: 'password123'
  },
  {
    tanar_nev: 'Tóth Erzsébet',
    tanar_email: 'toth.erzsebet@example.com',
    tanar_jelszo: 'password123'
  },
  {
    tanar_nev: 'Horváth Péter',
    tanar_email: 'horvath.peter@example.com',
    tanar_jelszo: 'password123'
  }
];

async function checkEmptyTable() {
  const teacherCount = await teacherRepository.count();
  if (teacherCount === 0) {
    const hashedTeachers = await Promise.all(
      dummyTeachers.map(async (t) => {
        const hashedPassword = await bcrypt.hash(t.tanar_jelszo, 10);
        return {
          tanar_nev: t.tanar_nev,
          tanar_email: t.tanar_email,
          tanar_jelszo: hashedPassword
        };
      })
    );

    await teacherRepository.bulkCreate(hashedTeachers, { validate: true });
    console.log('🌱 3 dummy tanár sikeresen hozzáadva az adatbázishoz.');
  }
}

module.exports = {
  dummyTeachers,
  checkEmptyTable
};

