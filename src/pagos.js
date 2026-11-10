// Helpers para las respuestas de /api/pagos (backend/routes/pagos.routes.js).
//
// GET /hijos/:id/cuotas → [{ id, periodo, vencimiento, total, estado, en_revision, pagado, saldo,
//   factura: { id, numero } | null, items: [{ id, concepto, descripcion, importe, estado }] }]
//   en_revision: hay un comprobante esperando aprobación; pagado/saldo cuentan solo los aprobados.
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

/** Lo que falta pagar según el backend: total menos los comprobantes aprobados. */
export function saldoPendiente(cuota) {
  return Number(cuota?.saldo) || 0;
}

/** Ítems con orden de pago generada (con o sin comprobante cargado). */
export function itemsInformados(cuota) {
  return itemsDe(cuota).filter((i) => i.estado === 'Pago informado');
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
 *   total_adeudado, comprobantes: [{ factura, periodo, ...comprobante }] }
 */
export function normalizarDeuda(data) {
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number(data?.total_adeudado) || 0,
    comprobantes: Array.isArray(data?.comprobantes) ? data.comprobantes : [],
  };
}

// Comprobante (en facturas y deuda): { id, numero_operacion, importe, fecha_transferencia,
//   fecha_carga, estado: 'En revisión' | 'Aprobado' | 'Rechazado', motivo_rechazo }
