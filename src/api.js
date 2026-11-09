import { getToken } from './storage';

export const API_URL = 'https://gestion-app-08gx.onrender.com';

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {number} status
   * @param {boolean} noDisponible La ruta todavía no existe en el servidor.
   */
  constructor(message, status, noDisponible = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.noDisponible = noDisponible;
  }
}

let onSesionVencida = null;

/** AuthContext registra acá qué hacer si el token deja de ser válido. */
export function setSesionVencidaHandler(fn) {
  onSesionVencida = fn;
}

/**
 * Hace un request al backend agregando el token guardado.
 * Devuelve el JSON de la respuesta o lanza ApiError con el message del backend.
 *
 * Opciones extra (además de las de fetch):
 * - publica: la ruta no requiere sesión (no se manda token). En el servidor actual
 *   una ruta pública inexistente responde 401 "No autenticado", así que en ese caso
 *   un 401 se toma como "todavía no disponible" (hoy: /api/auth/recuperar y /restablecer).
 */
export async function apiFetch(ruta, opciones = {}) {
  const { publica = false, headers: extraHeaders, ...fetchOpts } = opciones;
  const token = publica ? null : await getToken();
  const headers = {
    Accept: 'application/json',
    ...(fetchOpts.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };

  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, { ...fetchOpts, headers });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
  }

  const texto = await res.text();
  let data = null;
  let esJson = false;
  if (texto) {
    try {
      data = JSON.parse(texto);
      esJson = true;
    } catch {
      data = null;
    }
  }

  // Ruta inexistente: 404 sin JSON (los 404 reales, como "Factura no encontrada", traen message),
  // o 200 con HTML (el servidor devuelve la web para rutas desconocidas).
  if ((res.status === 404 && !esJson) || (res.ok && texto && !esJson) || (publica && res.status === 401)) {
    throw new ApiError('Disponible pronto', res.status, true);
  }

  if (!res.ok) {
    if (res.status === 401 && token) onSesionVencida?.();
    throw new ApiError(data?.message || `Error ${res.status}`, res.status);
  }

  return data;
}

/** Texto para mostrar al usuario a partir de un error. */
export function mensajeError(e) {
  if (e?.noDisponible) return 'Disponible pronto: esta función todavía no está habilitada.';
  return e?.message || 'Ocurrió un error inesperado.';
}
