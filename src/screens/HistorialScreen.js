import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { apiFetch } from '../api';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import HijoSelector, { RequiereHijo } from '../components/HijoSelector';
import Screen from '../components/Screen';
import { Cargando, ErrorView, Vacio } from '../components/StateViews';
import T from '../components/T';
import { useHijo } from '../context/HijoContext';
import { esPeriodoValido, formatFecha, formatMoney, formatPeriodo } from '../format';
import { useApi } from '../hooks/useApi';
import { iconoConcepto, normalizarDeuda } from '../pagos';
import { colors, fonts, radius } from '../theme';

const SEGMENTOS = [
  { id: 'facturas', titulo: 'Facturas' },
  { id: 'deuda', titulo: 'Deuda por ítem' },
];

/** "202603" → "2026-03" mientras se tipea. */
function mascaraPeriodo(texto) {
  const d = texto.replace(/\D/g, '').slice(0, 6);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

export default function HistorialScreen() {
  const { hijo, recargar: recargarHijos } = useHijo();
  const [segmento, setSegmento] = useState('facturas');
  const [filtro, setFiltro] = useState({ desde: '', hasta: '' });

  const facturas = useApi(
    () => {
      const qs = Object.entries(filtro)
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      return apiFetch(`/api/pagos/hijos/${hijo.id}/facturas${qs ? `?${qs}` : ''}`);
    },
    [hijo?.id, filtro.desde, filtro.hasta],
    { enabled: Boolean(hijo) && segmento === 'facturas' }
  );
  const deuda = useApi(() => apiFetch(`/api/pagos/hijos/${hijo.id}/deuda`), [hijo?.id], {
    enabled: Boolean(hijo) && segmento === 'deuda',
  });
  const actual = segmento === 'facturas' ? facturas : deuda;

  return (
    <Screen
      conTabBar
      titulo="Historial"
      onRefresh={() => (hijo ? actual.recargar({ silencioso: true }) : recargarHijos())}
      refrescando={actual.refrescando}
    >
      <RequiereHijo>
        {() => (
          <>
            <HijoSelector />
            <Segmentado valor={segmento} onChange={setSegmento} />
            {segmento === 'facturas' ? (
              <>
                <FiltroPeriodo filtro={filtro} onAplicar={setFiltro} />
                <ListaFacturas {...facturas} />
              </>
            ) : (
              <Deuda {...deuda} />
            )}
          </>
        )}
      </RequiereHijo>
    </Screen>
  );
}

function Segmentado({ valor, onChange }) {
  return (
    <View style={styles.segmentado} accessibilityRole="tablist">
      {SEGMENTOS.map((s) => {
        const activo = s.id === valor;
        return (
          <Pressable
            key={s.id}
            onPress={() => onChange(s.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activo }}
            style={[styles.segmento, activo && styles.segmentoActivo]}
          >
            <T style={[styles.segmentoTexto, activo && styles.segmentoTextoActivo]}>{s.titulo}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

function FiltroPeriodo({ filtro, onAplicar }) {
  const [desde, setDesde] = useState(filtro.desde);
  const [hasta, setHasta] = useState(filtro.hasta);
  const errorDesde = desde && !esPeriodoValido(desde) ? 'Formato AAAA-MM' : null;
  const errorHasta = hasta && !esPeriodoValido(hasta) ? 'Formato AAAA-MM' : hasta && desde && hasta < desde ? 'Antes de "desde"' : null;
  const cambiado = desde !== filtro.desde || hasta !== filtro.hasta;
  const hayFiltro = Boolean(filtro.desde || filtro.hasta);

  return (
    <View style={styles.filtro}>
      <View style={styles.filtroCampos}>
        <Field
          label="Desde"
          value={desde}
          onChangeText={(t) => setDesde(mascaraPeriodo(t))}
          placeholder="AAAA-MM"
          keyboardType="number-pad"
          maxLength={7}
          error={errorDesde}
          style={styles.filtroCampo}
        />
        <Field
          label="Hasta"
          value={hasta}
          onChangeText={(t) => setHasta(mascaraPeriodo(t))}
          placeholder="AAAA-MM"
          keyboardType="number-pad"
          maxLength={7}
          error={errorHasta}
          style={styles.filtroCampo}
        />
      </View>
      <View style={styles.filtroBotones}>
        {hayFiltro ? (
          <Button
            titulo="Limpiar"
            variante="secundario"
            onPress={() => {
              setDesde('');
              setHasta('');
              onAplicar({ desde: '', hasta: '' });
            }}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          titulo="Filtrar"
          variante="tinta"
          icono="funnel-outline"
          disabled={!cambiado || Boolean(errorDesde || errorHasta)}
          onPress={() => onAplicar({ desde, hasta })}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

function ListaFacturas({ data, cargando, error, recargar }) {
  if (cargando) return <Cargando />;
  if (error) return <ErrorView error={error} onRetry={recargar} />;
  if (!data?.length) {
    return <Vacio icono="document-text-outline" titulo="Sin facturas" texto="No hay facturas para el período elegido." />;
  }
  return data.map((f) => <TarjetaFactura key={f.id ?? f.numero} factura={f} />);
}

function TarjetaFactura({ factura }) {
  const comprobantes = Array.isArray(factura.comprobantes) ? factura.comprobantes : [];
  return (
    <Card style={styles.factura}>
      <View style={styles.facturaArriba}>
        <View style={{ flex: 1 }}>
          <T v="h3">{factura.periodo ? formatPeriodo(factura.periodo) : `Factura ${factura.numero ?? ''}`}</T>
          {factura.numero ? <T v="small">N.º {factura.numero}</T> : null}
        </View>
        {factura.estado ? <Badge texto={factura.estado} /> : null}
      </View>

      <View style={styles.facturaDatos}>
        <Dato etiqueta="Emitida" valor={formatFecha(factura.fecha_emision)} />
        <Dato etiqueta="Vence" valor={formatFecha(factura.vencimiento)} />
        <Dato etiqueta="Total" valor={formatMoney(factura.total)} fuerte />
      </View>

      <View style={styles.comprobantes}>
        <T v="overline" style={styles.comprobantesTitulo}>Comprobantes</T>
        {comprobantes.length === 0 ? (
          <T v="small">Sin comprobantes cargados.</T>
        ) : (
          comprobantes.map((c, i) => (
            <View key={c.id ?? i} style={styles.comprobante}>
              <Ionicons name="swap-horizontal-outline" size={16} color={colors.verde} />
              <View style={{ flex: 1 }}>
                <T v="label">Transferencia del {formatFecha(c.fecha_transferencia)}</T>
                {c.numero_operacion ? <T v="small">Op. {c.numero_operacion}</T> : null}
              </View>
              <T v="money" style={styles.comprobanteImporte}>{formatMoney(c.importe)}</T>
            </View>
          ))
        )}
      </View>
    </Card>
  );
}

function Dato({ etiqueta, valor, fuerte = false }) {
  return (
    <View style={{ flex: 1 }}>
      <T v="small">{etiqueta}</T>
      <T v={fuerte ? 'money' : 'bodyStrong'} style={fuerte && { fontSize: 15 }} numberOfLines={1}>{valor || '—'}</T>
    </View>
  );
}

function Deuda({ data, cargando, error, recargar }) {
  if (cargando) return <Cargando />;
  if (error) return <ErrorView error={error} onRetry={recargar} />;
  if (!data) return null;
  const { items, total } = normalizarDeuda(data);

  if (items.length === 0) {
    return <Vacio icono="checkmark-circle-outline" titulo="Sin deuda" texto="No hay ítems adeudados. ¡Está todo al día!" />;
  }

  return (
    <>
      <View style={styles.deudaTotal}>
        <T v="overline" style={{ color: colors.ambar }}>Total adeudado</T>
        <T v="moneyLg" style={{ color: colors.ambar }} adjustsFontSizeToFit numberOfLines={1}>
          {formatMoney(total)}
        </T>
      </View>
      <Card style={styles.deudaLista}>
        {items.map((it, i) => (
          <View key={it.id ?? i} style={[styles.deudaItem, i < items.length - 1 && styles.deudaBorde]}>
            <View style={styles.deudaIcono}>
              <Ionicons name={iconoConcepto(it.concepto)} size={20} color={colors.ambar} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="bodyStrong" numberOfLines={2}>{it.descripcion}</T>
              <T v="small">
                {formatPeriodo(it.periodo)} · vence el {formatFecha(it.vencimiento)}
              </T>
            </View>
            <View style={styles.deudaDerecha}>
              <T v="money">{formatMoney(it.importe)}</T>
              {it.estado === 'Pago informado' ? <Badge texto={it.estado} style={styles.deudaBadge} /> : null}
            </View>
          </View>
        ))}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  segmentado: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DC',
    borderRadius: radius.full,
    padding: 4,
    marginBottom: 18,
  },
  segmento: { flex: 1, height: 42, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  segmentoActivo: { backgroundColor: colors.tarjeta, boxShadow: '0px 2px 8px rgba(16, 49, 42, 0.10)' },
  segmentoTexto: { fontFamily: fonts.semibold, fontSize: 14, color: colors.textoSecundario },
  segmentoTextoActivo: { fontFamily: fonts.bold, color: colors.tinta },
  filtro: { marginBottom: 18 },
  filtroCampos: { flexDirection: 'row', gap: 12 },
  filtroCampo: { flex: 1, marginBottom: 10 },
  filtroBotones: { flexDirection: 'row', gap: 10 },
  factura: { marginBottom: 12 },
  facturaArriba: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  facturaDatos: { flexDirection: 'row', gap: 10, marginTop: 14 },
  comprobantes: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.linea },
  comprobantesTitulo: { marginBottom: 6 },
  comprobante: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  comprobanteImporte: { fontSize: 15 },
  deudaTotal: { backgroundColor: colors.ambarFondo, borderRadius: radius.lg, padding: 20, marginBottom: 14 },
  deudaLista: { paddingVertical: 4 },
  deudaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  deudaDerecha: { alignItems: 'flex-end' },
  deudaBadge: { alignSelf: 'flex-end', marginTop: 4 },
  deudaBorde: { borderBottomWidth: 1, borderBottomColor: colors.linea },
  deudaIcono: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.ambarFondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
