const messageService = require('../services/message.service');

// Uj uzenet kuldese
const sendMessage = async (req, res) => {
  try {
    const { role, id } = req.user;
    const message = await messageService.sendMessage(role, id, req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

// Egy ora beszelgetesfolyamanak lekerdezese
const getThread = async (req, res) => {
  try {
    const { role, id } = req.user;
    const lessonId = req.params.lessonId;
    const thread = await messageService.getThread(role, id, lessonId);
    res.json(thread);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  getThread
};
