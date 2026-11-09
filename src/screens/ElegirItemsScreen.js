import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { apiFetch, mensajeError } from '../api';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Screen from '../components/Screen';
import { Aviso, Vacio } from '../components/StateViews';
import T from '../components/T';
import { formatFecha, formatMoney, formatPeriodo } from '../format';
import { facturaIdDe, iconoConcepto, itemsDe } from '../pagos';
import { colors, radius, shadow } from '../theme';

export default function ElegirItemsScreen({ navigation, route }) {
  const { cuota } = route.params;
  const items = itemsDe(cuota);
  const [elegidos, setElegidos] = useState(
    () => new Set(items.filter((i) => i.estado === 'Pendiente').map((i) => i.id))
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const total = items.filter((i) => elegidos.has(i.id)).reduce((s, i) => s + (Number(i.importe) || 0), 0);

  function alternar(id) {
    setElegidos((prev) => {
      const sig = new Set(prev);
      if (sig.has(id)) sig.delete(id);
      else sig.add(id);
      return sig;
    });
  }

  async function generar() {
    setError(null);
    setEnviando(true);
    try {
      // Respuesta: { id, numero, fecha, alumno, legajo, periodo, factura, items: [{ id, descripcion, importe }], total }
      const orden = await apiFetch('/api/pagos/ordenes', {
        method: 'POST',
        body: JSON.stringify({ factura_id: facturaIdDe(cuota), items: [...elegidos] }),
      });
      // Los ítems de la orden no traen el concepto: se toma de la cuota para el ícono.
      const conceptoPorId = new Map(items.map((i) => [i.id, i.concepto]));
      navigation.replace('Comprobante', {
        orden,
        items: orden.items.map((i) => ({ ...i, concepto: conceptoPorId.get(i.id) })),
        total: orden.total,
        facturaId: facturaIdDe(cuota),
        periodo: orden.periodo,
      });
    } catch (e) {
      setError(mensajeError(e));
      setEnviando(false);
    }
  }

  return (
    <Screen
      atras
      subtitulo={`${formatPeriodo(cuota.periodo)} · vence el ${formatFecha(cuota.vencimiento)}`}
      titulo="Elegí qué pagar"
      footer={
        items.length ? (
          <View>
            <Aviso texto={error} />
            <View style={styles.totalFila}>
              <T v="bodyStrong">Total</T>
              <T v="money" style={styles.total}>{formatMoney(total)}</T>
            </View>
            <Button
              titulo="Generar comprobante de pago"
              onPress={generar}
              cargando={enviando}
              disabled={elegidos.size === 0}
            />
          </View>
        ) : null
      }
    >
      {items.length === 0 ? (
        <Vacio titulo="Sin ítems" texto="Esta cuota no tiene ítems para pagar." />
      ) : (
        <>
          <T v="small" style={styles.ayuda}>
            Podés pagar todo junto o solo algunos ítems. Los ítems ya pagados o informados no se pueden elegir.
          </T>
          {items.map((it) => {
            const habilitado = it.estado === 'Pendiente';
            const marcado = elegidos.has(it.id);
            return (
              <Pressable
                key={it.id}
                onPress={() => habilitado && alternar(it.id)}
                disabled={!habilitado}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: marcado, disabled: !habilitado }}
                accessibilityLabel={`${it.descripcion}, ${formatMoney(it.importe)}`}
                style={({ pressed }) => [
                  styles.item,
                  marcado && styles.itemMarcado,
                  !habilitado && styles.itemDeshabilitado,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.icono, marcado && styles.iconoMarcado]}>
                  <Ionicons name={iconoConcepto(it.concepto)} size={22} color={marcado ? colors.blanco : colors.verde} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="bodyStrong" numberOfLines={2}>{it.descripcion}</T>
                  {habilitado ? (
                    <T v="money" style={styles.importe}>{formatMoney(it.importe)}</T>
                  ) : (
                    <Badge texto={it.estado} style={styles.badge} />
                  )}
                </View>
                <View style={[styles.casilla, marcado && styles.casillaMarcada, !habilitado && styles.casillaOff]}>
                  {marcado ? <Ionicons name="checkmark" size={18} color={colors.blanco} /> : null}
                </View>
              </Pressable>
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ayuda: { marginBottom: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.tarjeta,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.suave,
  },
  itemMarcado: { borderColor: colors.verde },
  itemDeshabilitado: { opacity: 0.55 },
  icono: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoMarcado: { backgroundColor: colors.verde },
  importe: { marginTop: 2 },
  badge: { marginTop: 4 },
  casilla: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.linea,
    alignItems: 'center',
    justifyContent: 'center',
  },
  casillaMarcada: { backgroundColor: colors.verde, borderColor: colors.verde },
  casillaOff: { backgroundColor: colors.fondo },
  totalFila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  total: { fontSize: 24 },
});
