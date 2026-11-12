const notificationRepository = require('../repositories/notification.repository');

// Sajat ertesitesek lekerdezese (legujabb elol)
const getMyNotifications = async (role, userId) => {
  return await notificationRepository.findByRecipient(role, userId);
};

// Ertesites olvasottnak jelolese (csak sajat ertesites)
const markAsRead = async (notifId, role, userId) => {
  const notif = await notificationRepository.findById(notifId);
  if (!notif) {
    throw new Error('Az ertesites nem talalhato!');
  }

  if (notif.cimzett_tipus !== role || notif.cimzett_id !== userId) {
    throw new Error('Csak a sajat ertesitesedet jelolheted olvasottnak!');
  }

  await notificationRepository.markAsRead(notifId, role, userId);
  return { message: 'Ertesites sikeresen olvasottnak jelolve.' };
};

module.exports = {
  getMyNotifications,
  markAsRead
};

