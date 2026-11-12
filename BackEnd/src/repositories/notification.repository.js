const Notification = require('../models/Notification');

// Ertesitesek adattar (Repository)
const notificationRepository = {
  create: async (data) => {
    return await Notification.create(data);
  },

  // Cimzett alapjan legujabb elol
  findByRecipient: async (tipus, id) => {
    return await Notification.findAll({
      where: {
        cimzett_tipus: tipus,
        cimzett_id: id
      },
      order: [['createdAt', 'DESC']]
    });
  },

  findById: async (id) => {
    return await Notification.findByPk(id);
  },

  // Olvasottnak jeloles jogosultsag ellenorzessel (csak sajat ertesites)
  markAsRead: async (notifId, tipus, id) => {
    return await Notification.update(
      { olvasott: 1 },
      {
        where: {
          notif_ID: notifId,
          cimzett_tipus: tipus,
          cimzett_id: id
        }
      }
    );
  }
};

module.exports = notificationRepository;

