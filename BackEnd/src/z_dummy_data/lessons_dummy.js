// Orak tesztadatok (30 dummy ora tanarokhoz es diakokhoz rendelve)
const teacherRepository = require('../repositories/teacher.repository');
const studentRepository = require('../repositories/student.repository');
const lessonRepository = require('../repositories/lesson.repository');
const { SZABAD, FOGLALT, JOVAHAGYOTT, LEMONDVA } = require('../config/lessonStatus');

const dummyLessons = [
  // 1-10: Tanar 1 orai (Matematika, Fizika, Informatika)
  { tanarIndex: 1, diakIndex: null, tantargy: 'Matematika', napEltolas: 1, ora: 8, statusz: SZABAD },
  { tanarIndex: 1, diakIndex: null, tantargy: 'Fizika', napEltolas: 2, ora: 8, statusz: SZABAD },
  { tanarIndex: 1, diakIndex: null, tantargy: 'Informatika', napEltolas: 3, ora: 8, statusz: SZABAD },
  { tanarIndex: 1, diakIndex: null, tantargy: 'Matematika', napEltolas: 4, ora: 8, statusz: SZABAD },
  { tanarIndex: 1, diakIndex: 1, tantargy: 'Matematika', napEltolas: 1, ora: 9, statusz: FOGLALT },
  { tanarIndex: 1, diakIndex: 2, tantargy: 'Fizika', napEltolas: 2, ora: 10, statusz: FOGLALT },
  { tanarIndex: 1, diakIndex: 3, tantargy: 'Informatika', napEltolas: 3, ora: 11, statusz: FOGLALT },
  { tanarIndex: 1, diakIndex: 4, tantargy: 'Matematika', napEltolas: 4, ora: 14, statusz: JOVAHAGYOTT },
  { tanarIndex: 1, diakIndex: 5, tantargy: 'Fizika', napEltolas: 5, ora: 15, statusz: JOVAHAGYOTT },
  { tanarIndex: 1, diakIndex: 6, tantargy: 'Informatika', napEltolas: 6, ora: 9, statusz: LEMONDVA },

  // 11-20: Tanar 2 orai (Angol nyelv, Tortenelem, Magyar nyelv es irodalom)
  { tanarIndex: 2, diakIndex: null, tantargy: 'Angol nyelv', napEltolas: 1, ora: 12, statusz: SZABAD },
  { tanarIndex: 2, diakIndex: null, tantargy: 'Történelem', napEltolas: 2, ora: 12, statusz: SZABAD },
  { tanarIndex: 2, diakIndex: null, tantargy: 'Magyar nyelv és irodalom', napEltolas: 3, ora: 12, statusz: SZABAD },
  { tanarIndex: 2, diakIndex: null, tantargy: 'Angol nyelv', napEltolas: 4, ora: 12, statusz: SZABAD },
  { tanarIndex: 2, diakIndex: 7, tantargy: 'Angol nyelv', napEltolas: 7, ora: 10, statusz: FOGLALT },
  { tanarIndex: 2, diakIndex: 8, tantargy: 'Történelem', napEltolas: 8, ora: 11, statusz: FOGLALT },
  { tanarIndex: 2, diakIndex: 9, tantargy: 'Magyar nyelv és irodalom', napEltolas: 9, ora: 14, statusz: FOGLALT },
  { tanarIndex: 2, diakIndex: 10, tantargy: 'Angol nyelv', napEltolas: 10, ora: 15, statusz: JOVAHAGYOTT },
  { tanarIndex: 2, diakIndex: 11, tantargy: 'Történelem', napEltolas: 11, ora: 9, statusz: JOVAHAGYOTT },
  { tanarIndex: 2, diakIndex: 12, tantargy: 'Magyar nyelv és irodalom', napEltolas: 12, ora: 10, statusz: LEMONDVA },

  // 21-30: Tanar 3 orai (Kemia, Matematika, Informatika)
  { tanarIndex: 3, diakIndex: null, tantargy: 'Kémia', napEltolas: 5, ora: 8, statusz: SZABAD },
  { tanarIndex: 3, diakIndex: null, tantargy: 'Matematika', napEltolas: 6, ora: 8, statusz: SZABAD },
  { tanarIndex: 3, diakIndex: null, tantargy: 'Informatika', napEltolas: 7, ora: 8, statusz: SZABAD },
  { tanarIndex: 3, diakIndex: null, tantargy: 'Kémia', napEltolas: 8, ora: 8, statusz: SZABAD },
  { tanarIndex: 3, diakIndex: 13, tantargy: 'Kémia', napEltolas: 13, ora: 11, statusz: FOGLALT },
  { tanarIndex: 3, diakIndex: 14, tantargy: 'Matematika', napEltolas: 14, ora: 14, statusz: FOGLALT },
  { tanarIndex: 3, diakIndex: 15, tantargy: 'Informatika', napEltolas: 15, ora: 15, statusz: JOVAHAGYOTT },
  { tanarIndex: 3, diakIndex: 1, tantargy: 'Kémia', napEltolas: 16, ora: 16, statusz: JOVAHAGYOTT },
  { tanarIndex: 3, diakIndex: 2, tantargy: 'Matematika', napEltolas: 17, ora: 16, statusz: JOVAHAGYOTT },
  { tanarIndex: 3, diakIndex: null, tantargy: 'Informatika', napEltolas: 18, ora: 10, statusz: LEMONDVA }
];

async function checkEmptyTable() {
  const lessonCount = await lessonRepository.count();
  if (lessonCount === 0) {
    const teachers = await teacherRepository.findAll();
    const students = await studentRepository.findAll();

    if (!teachers || teachers.length === 0 || !students || students.length === 0) {
      console.warn('⚠️ Az órák betöltése kimaradt: nincs tanár vagy diák az adatbázisban.');
      return;
    }

    const mappedLessons = dummyLessons.map((item) => {
      const teacher = teachers[(item.tanarIndex - 1) % teachers.length];
      const student = item.diakIndex !== null ? students[(item.diakIndex - 1) % students.length] : null;

      const lessonTime = new Date();
      lessonTime.setDate(lessonTime.getDate() + item.napEltolas);
      lessonTime.setHours(item.ora, 0, 0, 0);

      return {
        tanar_id: teacher.tanar_ID,
        diak_id: student ? student.diak_ID : null,
        tantargy: item.tantargy,
        ora_TIME: lessonTime,
        statusz_id: item.statusz
      };
    });

    await lessonRepository.bulkCreate(mappedLessons, { validate: true });
    console.log('🌱 30 dummy óra sikeresen hozzáadva az adatbázishoz.');
  }
}

module.exports = {
  dummyLessons,
  checkEmptyTable
};

