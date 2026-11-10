import { StyleSheet, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import T from './T';

const TONOS = {
  ok: { fondo: colors.verdeClaro, texto: colors.verdeOscuro },
  pendiente: { fondo: colors.ambarFondo, texto: colors.ambar },
  error: { fondo: colors.rojoFondo, texto: colors.rojo },
  revision: { fondo: colors.azulFondo, texto: colors.azul },
  neutro: { fondo: '#EEEBE3', texto: colors.textoSecundario },
  invertido: { fondo: 'rgba(255,255,255,0.18)', texto: colors.blanco },
};

const TONO_POR_ESTADO = {
  Pagada: 'ok',
  Pagado: 'ok',
  Activa: 'ok',
  Inscripto: 'ok',
  Pendiente: 'pendiente',
  'Pago parcial': 'pendiente',
  'Pago informado': 'pendiente',
  Vencida: 'error',
  // Comprobantes de transferencia
  'En revisión': 'revision',
  'Pago en revisión': 'revision',
  Aprobado: 'ok',
  Rechazado: 'error',
};

export function tonoDeEstado(estado) {
  return TONO_POR_ESTADO[estado] ?? 'neutro';
}

export default function Badge({ texto, tono, style }) {
  const t = TONOS[tono ?? tonoDeEstado(texto)];
  return (
    <View style={[styles.badge, { backgroundColor: t.fondo }, style]}>
      <T style={[styles.texto, { color: t.texto }]} numberOfLines={1}>
        {texto}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  texto: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16 },
});
