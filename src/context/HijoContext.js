import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api';

const HijoContext = createContext(null);

export function HijoProvider({ children }) {
  const [hijos, setHijos] = useState([]);
  const [hijo, setHijo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarHijos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const lista = (await apiFetch('/api/familia/hijos')) ?? [];
      setHijos(lista);
      // Mantener el hijo elegido si sigue en la lista; si no, elegir el primero.
      setHijo((actual) => lista.find((h) => h.id === actual?.id) ?? lista[0] ?? null);
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarHijos();
  }, [cargarHijos]);

  const value = useMemo(
    () => ({ hijos, hijo, setHijo, cargando, error, recargar: cargarHijos }),
    [hijos, hijo, cargando, error, cargarHijos]
  );

  return <HijoContext.Provider value={value}>{children}</HijoContext.Provider>;
}

export function useHijo() {
  const ctx = useContext(HijoContext);
  if (!ctx) throw new Error('useHijo debe usarse dentro de HijoProvider');
  return ctx;
}
