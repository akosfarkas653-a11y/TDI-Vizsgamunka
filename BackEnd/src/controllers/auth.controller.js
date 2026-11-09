const authService = require('../services/auth.service');

// Diák regisztráció
const registerStudent = async (req, res) => {
  try {
    const { nev, email, jelszo } = req.body;
    if (!nev || !email || !jelszo) {
      return res.status(400).json({ error: 'Minden mezo kitoltese kotelezo (nev, email, jelszo)!' });
    }

    const student = await authService.registerStudent({ nev, email, jelszo });
    res.status(201).json({ message: 'Sikeres diak regisztracio!', student });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Bejelentkezés
const login = async (req, res) => {
  try {
    const { role, azonosito, jelszo } = req.body;
    if (!role || !azonosito || !jelszo) {
      return res.status(400).json({ error: 'Minden mezo kitoltese kotelezo (role, azonosito, jelszo)!' });
    }

    const result = await authService.login({ role, azonosito, jelszo });
    res.json({ message: 'Sikeres bejelentkezes!', ...result });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = {
  registerStudent,
  login
};

