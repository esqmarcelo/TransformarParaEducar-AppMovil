import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Carga datos con estados de carga y error.
 * `fn` devuelve una promesa; se vuelve a llamar cuando cambian `deps`.
 * Si `enabled` es false no se carga nada (por ejemplo, sin hijo elegido).
 */
export function useApi(fn, deps, { enabled = true } = {}) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(enabled);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);
  const pedido = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cargar = useCallback(fn, deps);

  const recargar = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!enabled) return;
      const id = ++pedido.current;
      if (silencioso) setRefrescando(true);
      else {
        setCargando(true);
        setError(null);
      }
      try {
        const resultado = await cargar();
        if (id !== pedido.current) return; // llegó una respuesta vieja
        setData(resultado);
        setError(null);
      } catch (e) {
        if (id !== pedido.current) return;
        if (!silencioso) setData(null);
        setError(e);
      } finally {
        if (id === pedido.current) {
          setCargando(false);
          setRefrescando(false);
        }
      }
    },
    [cargar, enabled]
  );

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { data, cargando, refrescando, error, recargar };
}
