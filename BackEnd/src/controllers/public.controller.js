const publicService = require('../services/public.service');

// Nyitolapi szurok (tantargyak es tanarok) lekerdezese
const getFilters = async (req, res) => {
  try {
    const filters = await publicService.getFilters();
    res.json(filters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getFilters
};
