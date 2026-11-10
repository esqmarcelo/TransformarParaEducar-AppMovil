import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { apiFetch } from '../api';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { Cargando, ErrorView, Vacio } from '../components/StateViews';
import T from '../components/T';
import { formatFechaHora } from '../format';
import { useApi } from '../hooks/useApi';
import { colors, radius } from '../theme';

// GET /api/notificaciones → { notificaciones: [{ id, mensaje, leida (0/1), fecha }], noLeidas }
// POST /api/notificaciones/leer → marca todas como leídas.
export default function NotificacionesScreen() {
  const { data, cargando, refrescando, error, recargar } = useApi(() => apiFetch('/api/notificaciones'), []);
  const lista = Array.isArray(data?.notificaciones) ? data.notificaciones : [];
  const noLeidas = Number(data?.noLeidas) || 0;

  // Al abrir la pantalla se marcan como leídas. La lista conserva el "leida" que llegó,
  // así se ven resaltadas las nuevas mientras la pantalla está abierta.
  useEffect(() => {
    if (noLeidas > 0) apiFetch('/api/notificaciones/leer', { method: 'POST' }).catch(() => {});
  }, [noLeidas]);

  return (
    <Screen atras titulo="Notificaciones" onRefresh={() => recargar({ silencioso: true })} refrescando={refrescando}>
      {cargando ? (
        <Cargando />
      ) : error ? (
        <ErrorView error={error} onRetry={recargar} />
      ) : lista.length === 0 ? (
        <Vacio
          icono="notifications-off-outline"
          titulo="Sin notificaciones"
          texto="Cuando el colegio te envíe un aviso (por ejemplo, sobre un comprobante) lo vas a ver acá."
        />
      ) : (
        lista.map((n) => {
          const nueva = !Number(n.leida);
          return (
            <Card key={n.id} style={[styles.item, nueva && styles.itemNueva]}>
              <View style={[styles.icono, nueva && styles.iconoNueva]}>
                <Ionicons name="notifications-outline" size={20} color={nueva ? colors.blanco : colors.verde} />
              </View>
              <View style={{ flex: 1 }}>
                <T v={nueva ? 'bodyStrong' : 'body'}>{n.mensaje}</T>
                <T v="small" style={styles.fecha}>{formatFechaHora(n.fecha)}</T>
              </View>
              {nueva ? <View style={styles.punto} accessibilityLabel="Nueva" /> : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, marginBottom: 10, borderRadius: radius.md },
  itemNueva: { borderWidth: 1.5, borderColor: colors.verde },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoNueva: { backgroundColor: colors.verde },
  fecha: { marginTop: 4 },
  punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.verde, marginTop: 6 },
});
