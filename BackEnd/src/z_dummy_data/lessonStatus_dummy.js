// OraStatusz tesztadatok es inicializalas
const lessonStatusRepository = require('../repositories/lessonStatus.repository');
const STATUS = require('../config/lessonStatus');

const dummyStatuses = [
  { statusz_ID: STATUS.SZABAD, statusz_nev: 'szabad' },
  { statusz_ID: STATUS.FOGLALT, statusz_nev: 'foglalt' },
  { statusz_ID: STATUS.JOVAHAGYOTT, statusz_nev: 'jovahagyott' },
  { statusz_ID: STATUS.LEMONDVA, statusz_nev: 'lemondva' }
];

async function checkEmptyTable() {
  const statusCount = await lessonStatusRepository.count();
  if (statusCount === 0) {
    await lessonStatusRepository.seedAll();
  }
}

module.exports = {
  dummyStatuses,
  checkEmptyTable
};

