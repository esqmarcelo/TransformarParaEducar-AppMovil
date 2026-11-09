import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ALTO_BOTON, colors, fonts, radius } from '../theme';
import T from './T';

const VARIANTES = {
  primario: { fondo: colors.verde, presionado: colors.verdeOscuro, texto: colors.blanco, borde: null },
  tinta: { fondo: colors.tinta, presionado: '#0A231D', texto: colors.blanco, borde: null },
  secundario: { fondo: colors.tarjeta, presionado: colors.fondo, texto: colors.tinta, borde: colors.linea },
  claro: { fondo: colors.verdeClaro, presionado: '#C9E9D7', texto: colors.verdeOscuro, borde: null },
  peligro: { fondo: colors.tarjeta, presionado: colors.rojoFondo, texto: colors.rojo, borde: colors.rojo },
};

export default function Button({
  titulo,
  onPress,
  variante = 'primario',
  icono,
  cargando = false,
  disabled = false,
  style,
}) {
  const v = VARIANTES[variante];
  const inactivo = disabled || cargando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? v.presionado : v.fondo },
        v.borde && { borderWidth: 1.5, borderColor: v.borde },
        disabled && styles.deshabilitado,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <View style={styles.fila}>
          {icono ? <Ionicons name={icono} size={20} color={v.texto} /> : null}
          <T style={[styles.texto, { color: v.texto }]} numberOfLines={1}>
            {titulo}
          </T>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: ALTO_BOTON,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontFamily: fonts.bold, fontSize: 16 },
  deshabilitado: { opacity: 0.45 },
});
