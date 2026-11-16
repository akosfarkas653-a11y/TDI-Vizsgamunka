// Diak tesztadatok (jelszo nyilt szovegkent: 'password123')
const bcrypt = require('bcryptjs');
const studentRepository = require('../repositories/student.repository');

const dummyStudents = [
  { diak_nev: 'Nagy Anna', diak_email: 'nagy.anna@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Szabó Bence', diak_email: 'szabo.bence@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Varga Dániel', diak_email: 'varga.daniel@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Kiss Eszter', diak_email: 'kiss.eszter@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Molnár Flóra', diak_email: 'molnar.flora@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Németh Gábor', diak_email: 'nemeth.gabor@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Farkas Hanna', diak_email: 'farkas.hanna@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Balogh Imre', diak_email: 'balogh.imre@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Papp Júlia', diak_email: 'papp.julia@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Takács Kristóf', diak_email: 'takacs.kristof@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Juhász Lili', diak_email: 'juhasz.lili@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Mészáros Máté', diak_email: 'meszaros.mate@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Simon Nóra', diak_email: 'simon.nora@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Rácz Olivér', diak_email: 'racz.oliver@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Fekete Petra', diak_email: 'fekete.petra@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Szilágyi Roland', diak_email: 'szilagyi.roland@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Török Sára', diak_email: 'torok.sara@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Fehér Tamás', diak_email: 'feher.tamas@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Gál Viktória', diak_email: 'gal.viktoria@example.com', diak_jelszo: 'password123' },
  { diak_nev: 'Vass Zoltán', diak_email: 'vass.zoltan@example.com', diak_jelszo: 'password123' }
];

async function checkEmptyTable() {
  const studentCount = await studentRepository.count();
  if (studentCount === 0) {
    const hashedStudents = await Promise.all(
      dummyStudents.map(async (s) => {
        const hashedPassword = await bcrypt.hash(s.diak_jelszo, 10);
        return {
          diak_nev: s.diak_nev,
          diak_email: s.diak_email,
          diak_jelszo: hashedPassword
        };
      })
    );

    await studentRepository.bulkCreate(hashedStudents, { validate: true });
    console.log('🌱 20 dummy diák sikeresen hozzáadva az adatbázishoz.');
  }
}

module.exports = {
  dummyStudents,
  checkEmptyTable
};

