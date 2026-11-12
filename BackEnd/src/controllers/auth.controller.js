const authService = require('../services/auth.service');

// Diak regisztracio vezerlo
const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Sikeres regisztracio!', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Bejelentkezes vezerlo
const login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json({ message: 'Sikeres bejelentkezes!', ...result });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = {
  register,
  login
};
