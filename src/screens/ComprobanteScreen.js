import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import T from '../components/T';
import { ALIAS_COLEGIO, CBU_COLEGIO } from '../config';
import { formatFecha, formatMoney, formatPeriodo } from '../format';
import { iconoConcepto } from '../pagos';
import { colors, fonts, radius } from '../theme';

// "Descargar PDF" necesita expo-print, que no está instalado: el botón queda oculto.
const PDF_DISPONIBLE = false;

export default function ComprobanteScreen({ navigation, route }) {
  const { orden, items, total, facturaId, periodo } = route.params;

  return (
    <Screen>
      <View style={styles.cabecera}>
        <View style={styles.tilde}>
          <Ionicons name="checkmark" size={38} color={colors.blanco} />
        </View>
        <T v="h1" style={styles.centro}>Comprobante generado</T>
        <T v="small" style={styles.centro}>
          Orden N.º {orden.numero} · {formatFecha(orden.fecha)}
        </T>
        {orden.alumno ? (
          <T v="small" style={styles.centro}>
            {orden.alumno} · Factura {orden.factura}
          </T>
        ) : null}
      </View>

      <Card style={styles.bloque}>
        <T v="overline" style={styles.overline}>{periodo ? `Ítems · ${formatPeriodo(periodo)}` : 'Ítems'}</T>
        {items.map((it, i) => (
          <View key={it.id ?? i} style={[styles.item, i < items.length - 1 && styles.itemBorde]}>
            <Ionicons name={iconoConcepto(it.concepto)} size={18} color={colors.verde} />
            <T v="body" style={{ flex: 1 }} numberOfLines={2}>{it.descripcion}</T>
            <T v="money" style={styles.itemImporte}>{formatMoney(it.importe)}</T>
          </View>
        ))}
        <View style={styles.totalCaja}>
          <T v="bodyStrong">Total a transferir</T>
          <T v="money" style={styles.total}>{formatMoney(total)}</T>
        </View>
      </Card>

      <View style={styles.banco}>
        <T v="overline" style={styles.bancoOverline}>Transferí a la cuenta del colegio</T>
        <DatoCopiable etiqueta="Alias" valor={ALIAS_COLEGIO} />
        <View style={styles.bancoSeparador} />
        <DatoCopiable etiqueta="CBU" valor={CBU_COLEGIO} />
      </View>

      <Button
        titulo="Ya transferí: cargar comprobante"
        icono="cloud-upload-outline"
        onPress={() => navigation.navigate('CargarTransferencia', { facturaId, importe: total })}
        disabled={!facturaId}
        style={styles.boton}
      />
      {PDF_DISPONIBLE ? (
        <Button titulo="Descargar PDF" variante="secundario" icono="download-outline" style={styles.boton} />
      ) : null}
      <Button titulo="Volver al inicio" variante="secundario" onPress={() => navigation.popToTop()} style={styles.boton} />
    </Screen>
  );
}

function DatoCopiable({ etiqueta, valor }) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copiar() {
    await Clipboard.setStringAsync(valor);
    setCopiado(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <View style={styles.dato}>
      <View style={{ flex: 1 }}>
        <T v="small" style={styles.datoEtiqueta}>{etiqueta}</T>
        <T style={styles.datoValor} selectable>{valor}</T>
      </View>
      <Pressable
        onPress={copiar}
        accessibilityRole="button"
        accessibilityLabel={`Copiar ${etiqueta}`}
        style={({ pressed }) => [styles.copiar, copiado && styles.copiado, pressed && { opacity: 0.8 }]}
      >
        <Ionicons name={copiado ? 'checkmark' : 'copy-outline'} size={16} color={copiado ? colors.tinta : colors.blanco} />
        <T style={[styles.copiarTexto, copiado && { color: colors.tinta }]}>{copiado ? 'Copiado' : 'Copiar'}</T>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecera: { alignItems: 'center', marginTop: 12, marginBottom: 22 },
  tilde: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0px 10px 24px rgba(11, 122, 85, 0.3)',
  },
  centro: { textAlign: 'center' },
  bloque: { marginBottom: 16 },
  overline: { marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  itemBorde: { borderBottomWidth: 1, borderBottomColor: colors.linea },
  itemImporte: { fontSize: 15 },
  totalCaja: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    padding: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.verdeClaro,
  },
  total: { fontSize: 22, color: colors.verdeOscuro },
  banco: { backgroundColor: colors.tinta, borderRadius: radius.lg, padding: 20, marginBottom: 20 },
  bancoOverline: { color: '#B9CCC4', marginBottom: 12 },
  bancoSeparador: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 12 },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  datoEtiqueta: { color: '#B9CCC4' },
  datoValor: { fontFamily: fonts.tituloBold, fontSize: 17, color: colors.blanco, fontVariant: ['tabular-nums'] },
  copiar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  copiado: { backgroundColor: colors.verdeClaro },
  copiarTexto: { fontFamily: fonts.bold, fontSize: 13, color: colors.blanco },
  boton: { marginBottom: 10 },
});
