/**
 * Dátum és idő formázó segédfüggvények magyar nyelven
 */

export function formatHungarianDateTime(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function formatHungarianDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

export function formatHungarianTime(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('hu-HU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}
