const bcrypt = require('bcryptjs');
const adminRepository = require('../repositories/admin.repository');

// Alapertelmezett admin fiok letrehozasa ha meg nem letezik
const seedAdmin = async () => {
  const existing = await adminRepository.findByName('admin');
  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await adminRepository.create({
      admin_nev: 'admin',
      admin_jelszo: hashedPassword
    });
    console.log('Alapertelmezett admin letrehozva (nev: admin, jelszo: admin123).');
  }
};

module.exports = seedAdmin;

// Kozvetlen parancssori futtatas tamogatasa (npm run seed)
if (require.main === module) {
  const { sequelize } = require('../models');
  const lessonStatusRepository = require('../repositories/lessonStatus.repository');

  (async () => {
    try {
      await sequelize.sync();
      await lessonStatusRepository.seedAll();
      await seedAdmin();
      console.log('Adatbazis seed sikeresen befejezodott.');
      process.exit(0);
    } catch (err) {
      console.error('Seed hiba:', err);
      process.exit(1);
    }
  })();
}

