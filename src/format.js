const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** 12345.5 → "$ 12.345,50" */
export function formatMoney(valor) {
  const n = Number(valor) || 0;
  const [entero, dec] = Math.abs(n).toFixed(2).split('.');
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '-' : ''}$ ${miles}${dec === '00' ? '' : `,${dec}`}`;
}

/** "2026-03" → "Marzo 2026" */
export function formatPeriodo(periodo) {
  const m = /^(\d{4})-(\d{2})/.exec(periodo || '');
  if (!m) return periodo || '';
  return `${MESES[Number(m[2]) - 1] ?? m[2]} ${m[1]}`;
}

/** "2026-03" → "Marzo" */
export function mesDePeriodo(periodo) {
  return formatPeriodo(periodo).split(' ')[0];
}

/** "2026-03-10" (o con hora) → "10/03/2026" */
export function formatFecha(fecha) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha || '');
  if (!m) return fecha || '';
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function iniciales(nombre = '', apellido = '') {
  return `${nombre.trim()[0] ?? ''}${apellido.trim()[0] ?? ''}`.toUpperCase() || '?';
}

/** Fecha de hoy en hora local como "AAAA-MM-DD". */
export function hoyISO() {
  const d = new Date();
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function esFechaValida(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!m) return false;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.getFullYear() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[3]);
}

export function esPeriodoValido(texto) {
  const m = /^(\d{4})-(\d{2})$/.exec(texto);
  return Boolean(m) && Number(m[2]) >= 1 && Number(m[2]) <= 12;
}

/** Acepta "12500", "12.500", "12500,50" o "12.500,50" → número (o NaN). */
export function parseImporte(texto) {
  const limpio = String(texto).trim().replace(/\s|\$/g, '');
  if (!limpio) return NaN;
  const normal = limpio.includes(',') ? limpio.replace(/\./g, '').replace(',', '.') : limpio.replace(/\.(?=\d{3}(\D|$))/g, '');
  return /^\d+(\.\d{1,2})?$/.test(normal) ? Number(normal) : NaN;
}
