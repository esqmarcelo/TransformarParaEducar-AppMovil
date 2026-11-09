import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch, ApiError, setSesionVencidaHandler } from '../api';
import { clearSession, loadSession, saveSession } from '../storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  // Si la sesión ya estaba guardada, entrar directo.
  useEffect(() => {
    loadSession()
      .then((sesion) => {
        if (sesion?.user?.rol === 'padre') setUser(sesion.user);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  // Si el backend rechaza el token (vencido o inválido), volver al login.
  useEffect(() => {
    setSesionVencidaHandler(logout);
    return () => setSesionVencidaHandler(null);
  }, [logout]);

  const login = useCallback(async (email, password) => {
    let data;
    try {
      data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        throw new Error('Credenciales inválidas');
      }
      throw e;
    }

    const { token, ...usuario } = data;
    if (usuario.rol !== 'padre') {
      throw new Error('Esta app es para padres');
    }
    await saveSession(token, usuario);
    setUser(usuario);
  }, []);

  const value = useMemo(() => ({ user, cargando, login, logout }), [user, cargando, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
