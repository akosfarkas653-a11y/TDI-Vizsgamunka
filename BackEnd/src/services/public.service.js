const lessonRepository = require('../repositories/lesson.repository');

// Publikus szurok lekerdezese a nyitolap comboboxokhoz
const getFilters = async () => {
  const { subjects, teachers } = await lessonRepository.findFreeFilters();

  const cleanSubjects = [...new Set(subjects.filter((s) => s && s.trim().length > 0).map((s) => s.trim()))].sort((a, b) =>
    a.localeCompare(b, 'hu')
  );
  const cleanTeachers = [...new Set(teachers.filter((t) => t && t.trim().length > 0).map((t) => t.trim()))].sort((a, b) =>
    a.localeCompare(b, 'hu')
  );

  return {
    subjects: cleanSubjects,
    teachers: cleanTeachers
  };
};

module.exports = {
  getFilters
};
