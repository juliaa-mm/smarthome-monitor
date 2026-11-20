export const STATE_META = {
  ON: { label: 'Увімкнено', tone: 'success', icon: '●' },
  OFF: { label: 'Вимкнено', tone: 'neutral', icon: '○' },
  ERROR: { label: 'Помилка', tone: 'danger', icon: '▲' },
  OFFLINE: { label: 'Не в мережі', tone: 'warning', icon: '◌' },
};

export const STATE_OPTIONS = Object.entries(STATE_META).map(([value, m]) => ({ value, label: m.label }));

const UNIT_NAMES = { 'лк': 'лк (люкс)', ppm: 'ppm (частин на мільйон)', 'Вт': 'Вт (ват)' };
export const unitLabel = (u) => UNIT_NAMES[u] || u;

export const MODE_META = {
  AUTO: 'Автоматичний',
  MANUAL: 'Ручний',
};
export const MODE_OPTIONS = Object.entries(MODE_META).map(([value, label]) => ({ value, label }));

export function fmtDateTime(v) {
  if (!v) return '—';
  const [d, t = ''] = String(v).split(/[ T]/);
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}${t ? ' ' + t.slice(0, 5) : ''}`;
}

export function fmtDate(v) {
  if (!v) return '—';
  const [y, m, d] = String(v).slice(0, 10).split('-');
  return `${d}.${m}.${y}`;
}

export function fmtNumber(v, digits = 1) {
  if (v === null || v === undefined || v === '') return '—';
  return Number(v).toLocaleString('uk-UA', { minimumFractionDigits: 0, maximumFractionDigits: digits });
}

export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
