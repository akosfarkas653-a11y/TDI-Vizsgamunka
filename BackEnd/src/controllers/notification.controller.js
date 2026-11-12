const notificationService = require('../services/notification.service');

// Sajat ertesitesek listazasa
const getNotifications = async (req, res) => {
  try {
    const { role, id } = req.user;
    const notifications = await notificationService.getMyNotifications(role, id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ertesites olvasottnak jelolese
const markAsRead = async (req, res) => {
  try {
    const { role, id } = req.user;
    const notifId = req.params.id;
    const result = await notificationService.markAsRead(notifId, role, id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};

