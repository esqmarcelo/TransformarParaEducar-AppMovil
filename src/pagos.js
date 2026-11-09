// Helpers para las respuestas de /api/pagos (backend/routes/pagos.routes.js).
//
// GET /hijos/:id/cuotas → [{ id, periodo, vencimiento, total, estado,
//   factura: { id, numero } | null, items: [{ id, concepto, descripcion, importe, estado }] }]
//   estado de cuota: 'Pendiente' | 'Pago parcial' | 'Pagada' | 'Vencida'
//   estado de ítem:  'Pendiente' | 'Pago informado' | 'Pagado'
// Los importes llegan como texto (NUMERIC de PostgreSQL): siempre pasar por Number().

export const ESTADOS_ADEUDADOS = ['Pendiente', 'Pago parcial', 'Vencida'];

export const ICONO_CONCEPTO = {
  cuota: 'school-outline',
  deporte: 'basketball-outline',
  transporte: 'bus-outline',
  comedor: 'restaurant-outline',
};

export function iconoConcepto(concepto) {
  return ICONO_CONCEPTO[concepto] ?? 'receipt-outline';
}

export function facturaIdDe(cuota) {
  return cuota?.factura?.id ?? null;
}

export function itemsDe(cuota) {
  return Array.isArray(cuota?.items) ? cuota.items : [];
}

const sumar = (items) => items.reduce((s, i) => s + (Number(i.importe) || 0), 0);

/** Lo que falta pagar: los ítems que no están 'Pagado' (incluye los 'Pago informado'). */
export function saldoPendiente(cuota) {
  return sumar(itemsDe(cuota).filter((i) => i.estado !== 'Pagado'));
}

/** Ítems con orden de pago generada a los que les falta el comprobante de transferencia. */
export function itemsInformados(cuota) {
  return itemsDe(cuota).filter((i) => i.estado === 'Pago informado');
}

export function sumaImportes(items) {
  return sumar(items);
}

/** Separa la cuota adeudada más próxima del resto. */
export function separarCuotas(cuotas) {
  const lista = Array.isArray(cuotas) ? cuotas : [];
  const adeudadas = lista
    .filter((c) => ESTADOS_ADEUDADOS.includes(c.estado))
    .sort((a, b) => String(a.vencimiento).localeCompare(String(b.vencimiento)));
  const proxima = adeudadas[0] ?? null;
  // El backend ya las manda de la más reciente a la más antigua.
  const resto = lista.filter((c) => c !== proxima);
  return { proxima, resto };
}

/**
 * GET /hijos/:id/deuda → { items: [{ id, periodo, vencimiento, concepto, descripcion, importe, estado }],
 *   total_adeudado }
 */
export function normalizarDeuda(data) {
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number(data?.total_adeudado) || 0,
  };
}
