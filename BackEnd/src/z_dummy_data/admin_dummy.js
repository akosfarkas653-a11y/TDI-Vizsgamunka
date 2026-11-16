// Admin tesztadatok (jelszo nyilt szovegkent: 'admin')
const bcrypt = require('bcryptjs');
const adminRepository = require('../repositories/admin.repository');

const dummyAdmin = {
  admin_nev: 'admin',
  admin_jelszo: 'admin'
};

async function checkEmptyTable() {
  const adminCount = await adminRepository.count();
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash(dummyAdmin.admin_jelszo, 10);
    await adminRepository.create({
      admin_nev: dummyAdmin.admin_nev,
      admin_jelszo: hashedPassword
    });
    console.log('🌱 Az admin (admin / admin) sikeresen hozzáadva az adatbázishoz.');
  }
}

module.exports = {
  dummyAdmin,
  checkEmptyTable
};

