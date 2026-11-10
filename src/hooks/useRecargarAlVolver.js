import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Llama a `recargar` cada vez que la pantalla vuelve a estar visible (no en la
 * primera vez: ahí ya carga useApi al montarse).
 */
export function useRecargarAlVolver(recargar) {
  const primeraVez = useRef(true);
  const ultimo = useRef(recargar);
  useEffect(() => {
    ultimo.current = recargar;
  });

  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }
      ultimo.current();
    }, [])
  );
}
