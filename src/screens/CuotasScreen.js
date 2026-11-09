import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { apiFetch } from '../api';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import HijoSelector, { RequiereHijo } from '../components/HijoSelector';
import Screen from '../components/Screen';
import { Cargando, ErrorView, Vacio } from '../components/StateViews';
import T from '../components/T';
import { useAuth } from '../context/AuthContext';
import { useHijo } from '../context/HijoContext';
import { formatFecha, formatMoney, formatPeriodo, mesDePeriodo } from '../format';
import { useApi } from '../hooks/useApi';
import {
  facturaIdDe,
  iconoConcepto,
  itemsDe,
  itemsInformados,
  saldoPendiente,
  separarCuotas,
  sumaImportes,
} from '../pagos';
import { colors, fonts, radius } from '../theme';

export default function CuotasScreen({ navigation }) {
  const { user } = useAuth();
  const { hijo, recargar: recargarHijos } = useHijo();
  const { data, cargando, refrescando, error, recargar } = useApi(
    () => apiFetch(`/api/pagos/hijos/${hijo.id}/cuotas`),
    [hijo?.id],
    { enabled: Boolean(hijo) }
  );

  // Al volver de pagar, actualizar sin mostrar la carga completa.
  const primeraVez = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primeraVez.current) {
        primeraVez.current = false;
        return;
      }
      recargar({ silencioso: true });
    }, [recargar])
  );

  const { proxima, resto } = separarCuotas(data);

  return (
    <Screen
      conTabBar
      subtitulo="Inicio"
      titulo={`Hola, ${user?.nombre ?? ''}`}
      onRefresh={() => (hijo ? recargar({ silencioso: true }) : recargarHijos())}
      refrescando={refrescando}
    >
      <RequiereHijo>
        {() => (
          <>
            <HijoSelector />
            {cargando ? (
              <Cargando texto="Buscando cuotas…" />
            ) : error ? (
              <ErrorView error={error} onRetry={recargar} />
            ) : !data?.length ? (
              <Vacio icono="receipt-outline" titulo="Sin cuotas por ahora" texto="Cuando el colegio emita una cuota la vas a ver acá." />
            ) : (
              <>
                {proxima ? (
                  <CuotaDestacada
                    cuota={proxima}
                    onPagar={() => navigation.navigate('ElegirItems', { cuota: proxima })}
                    onCargarComprobante={() =>
                      navigation.navigate('CargarTransferencia', {
                        facturaId: facturaIdDe(proxima),
                        importe: sumaImportes(itemsInformados(proxima)),
                      })
                    }
                  />
                ) : (
                  <AlDia />
                )}
                {resto.length > 0 ? (
                  <>
                    <T v="h2" style={styles.seccion}>Mis cuotas</T>
                    <Card style={styles.lista}>
                      {resto.map((c, i) => (
                        <FilaCuota key={c.id ?? c.periodo} cuota={c} ultima={i === resto.length - 1} />
                      ))}
                    </Card>
                  </>
                ) : null}
              </>
            )}
          </>
        )}
      </RequiereHijo>
    </Screen>
  );
}

function CuotaDestacada({ cuota, onPagar, onCargarComprobante }) {
  const items = itemsDe(cuota);
  const sinFactura = !facturaIdDe(cuota);
  const hayPendientes = items.some((i) => i.estado === 'Pendiente');
  // Ya generó la orden de pago de estos ítems pero todavía no cargó la transferencia.
  const faltaComprobante = !hayPendientes && itemsInformados(cuota).length > 0;

  return (
    <View style={styles.destacada}>
      <View style={styles.destacadaArriba}>
        <T v="overline" style={styles.claroSuave}>Próxima cuota</T>
        <Badge texto={cuota.estado} tono={cuota.estado === 'Vencida' ? 'error' : 'pendiente'} />
      </View>
      <T v="h2" style={styles.blanco}>{formatPeriodo(cuota.periodo)}</T>
      <View style={styles.vence}>
        <Ionicons name="calendar-outline" size={15} color="#CDEBDD" />
        <T v="small" style={styles.claroSuave}>Vence el {formatFecha(cuota.vencimiento)}</T>
      </View>

      <T v="small" style={[styles.claroSuave, styles.totalLabel]}>
        {cuota.estado === 'Pago parcial' ? 'Saldo a pagar' : 'Total a pagar'}
      </T>
      <T v="moneyLg" style={styles.blanco} adjustsFontSizeToFit numberOfLines={1}>
        {formatMoney(saldoPendiente(cuota))}
      </T>

      {items.length > 0 ? (
        <View style={styles.chips}>
          {items.map((it) => (
            <View key={it.id} style={[styles.chip, it.estado !== 'Pendiente' && styles.chipPagado]}>
              <Ionicons name={iconoConcepto(it.concepto)} size={14} color={colors.blanco} />
              <T style={styles.chipTexto} numberOfLines={1}>{it.descripcion}</T>
              {it.estado !== 'Pendiente' ? <Ionicons name="checkmark" size={14} color={colors.blanco} /> : null}
            </View>
          ))}
        </View>
      ) : null}

      {faltaComprobante ? (
        <Button
          titulo="Cargar comprobante"
          variante="claro"
          icono="cloud-upload-outline"
          onPress={onCargarComprobante}
          disabled={sinFactura}
          style={styles.pagar}
        />
      ) : (
        <Button
          titulo="Pagar ítems"
          variante="claro"
          icono="wallet-outline"
          onPress={onPagar}
          disabled={sinFactura || !hayPendientes}
          style={styles.pagar}
        />
      )}
      {faltaComprobante && !sinFactura ? (
        <T v="small" style={[styles.claroSuave, styles.nota]}>Ya generaste la orden de pago. Falta cargar la transferencia.</T>
      ) : null}
      {sinFactura ? (
        <T v="small" style={[styles.claroSuave, styles.nota]}>La factura de este período todavía no está emitida.</T>
      ) : null}
    </View>
  );
}

function AlDia() {
  return (
    <View style={styles.alDia}>
      <View style={styles.alDiaIcono}>
        <Ionicons name="checkmark" size={26} color={colors.blanco} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="h3" style={{ color: colors.verdeOscuro }}>Estás al día</T>
        <T v="small">No hay cuotas pendientes de pago.</T>
      </View>
    </View>
  );
}

function FilaCuota({ cuota, ultima }) {
  const items = itemsDe(cuota);
  const detalle = items.length
    ? items.map((i) => i.descripcion).join(' · ')
    : `Vence el ${formatFecha(cuota.vencimiento)}`;
  const anio = String(cuota.periodo ?? '').slice(0, 4);

  return (
    <View style={[styles.fila, !ultima && styles.filaBorde]}>
      <View style={styles.filaMes}>
        <T style={styles.filaMesTexto}>{mesDePeriodo(cuota.periodo).slice(0, 3)}</T>
        <T style={styles.filaAnio}>{anio}</T>
      </View>
      <View style={{ flex: 1 }}>
        <T v="bodyStrong">{mesDePeriodo(cuota.periodo)}</T>
        <T v="small" numberOfLines={1}>{detalle}</T>
      </View>
      <View style={styles.filaDerecha}>
        <T v="money">{formatMoney(cuota.total)}</T>
        <Badge texto={cuota.estado} style={styles.filaBadge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  destacada: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg,
    padding: 22,
    boxShadow: '0px 12px 28px rgba(11, 122, 85, 0.28)',
  },
  destacadaArriba: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  blanco: { color: colors.blanco },
  claroSuave: { color: '#CDEBDD' },
  vence: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  totalLabel: { marginTop: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.16)',
    maxWidth: '100%',
  },
  chipPagado: { opacity: 0.6 },
  chipTexto: { fontFamily: fonts.semibold, fontSize: 13, color: colors.blanco, flexShrink: 1 },
  pagar: { marginTop: 20 },
  nota: { marginTop: 10, textAlign: 'center' },
  alDia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.verdeClaro,
    borderRadius: radius.lg,
    padding: 18,
  },
  alDiaIcono: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seccion: { marginTop: 28, marginBottom: 12 },
  lista: { paddingVertical: 4 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  filaBorde: { borderBottomWidth: 1, borderBottomColor: colors.linea },
  filaMes: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaMesTexto: { fontFamily: fonts.tituloBold, fontSize: 15, color: colors.tinta, textTransform: 'uppercase' },
  filaAnio: { fontFamily: fonts.semibold, fontSize: 11, color: colors.textoSecundario },
  filaDerecha: { alignItems: 'flex-end' },
  filaBadge: { alignSelf: 'flex-end', marginTop: 4 },
});
