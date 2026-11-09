import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHijo } from '../context/HijoContext';
import { colors, radius, shadow } from '../theme';
import Avatar from './Avatar';
import { Cargando, ErrorView, Vacio } from './StateViews';
import T from './T';

/** Tarjeta con el hijo elegido y "Cambiar", que abre la lista de hijos. */
export default function HijoSelector({ style }) {
  const { hijos, hijo, setHijo } = useHijo();
  const [abierto, setAbierto] = useState(false);
  const insets = useSafeAreaInsets();
  if (!hijo) return null;
  const variosHijos = hijos.length > 1;

  return (
    <>
      <Pressable
        onPress={() => variosHijos && setAbierto(true)}
        disabled={!variosHijos}
        accessibilityRole="button"
        accessibilityLabel={`Alumno: ${hijo.nombre} ${hijo.apellido}${variosHijos ? '. Cambiar' : ''}`}
        style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.85 }, style]}
      >
        <Avatar nombre={hijo.nombre} apellido={hijo.apellido} />
        <View style={styles.datos}>
          <T v="bodyStrong" numberOfLines={1}>
            {hijo.nombre} {hijo.apellido}
          </T>
          <T v="small" numberOfLines={1}>{hijo.curso_nombre || 'Sin curso asignado'}</T>
        </View>
        {variosHijos ? (
          <View style={styles.cambiar}>
            <T v="label" style={styles.cambiarTexto}>Cambiar</T>
            <Ionicons name="chevron-down" size={16} color={colors.verde} />
          </View>
        ) : null}
      </Pressable>

      <Modal visible={abierto} transparent animationType="slide" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondoModal} onPress={() => setAbierto(false)} accessibilityLabel="Cerrar" />
        <View style={[styles.hoja, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.agarre} />
          <T v="h2" style={styles.hojaTitulo}>Elegí un hijo</T>
          <ScrollView>
            {hijos.map((h) => {
              const activo = h.id === hijo.id;
              return (
                <Pressable
                  key={h.id}
                  onPress={() => {
                    setHijo(h);
                    setAbierto(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activo }}
                  style={({ pressed }) => [styles.opcion, activo && styles.opcionActiva, pressed && { opacity: 0.8 }]}
                >
                  <Avatar nombre={h.nombre} apellido={h.apellido} size={40} />
                  <View style={styles.datos}>
                    <T v="bodyStrong">{h.nombre} {h.apellido}</T>
                    <T v="small">{h.curso_nombre || 'Sin curso asignado'}</T>
                  </View>
                  {activo ? <Ionicons name="checkmark-circle" size={24} color={colors.verde} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/**
 * Muestra carga, error o vacío mientras no hay hijo elegido; si hay, renderiza children(hijo).
 */
export function RequiereHijo({ children }) {
  const { hijo, hijos, cargando, error, recargar } = useHijo();
  if (cargando) return <Cargando />;
  if (error) return <ErrorView error={error} onRetry={recargar} />;
  if (hijos.length === 0 || !hijo) {
    return (
      <Vacio
        icono="people-outline"
        titulo="Sin alumnos asociados"
        texto="Tu cuenta todavía no tiene hijos vinculados. Consultá con la administración del colegio."
      />
    );
  }
  return children(hijo);
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.tarjeta,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 18,
    ...shadow.suave,
  },
  datos: { flex: 1 },
  cambiar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.verdeClaro,
  },
  cambiarTexto: { color: colors.verde },
  fondoModal: { flex: 1, backgroundColor: 'rgba(16, 49, 42, 0.45)' },
  hoja: {
    backgroundColor: colors.fondo,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '70%',
  },
  agarre: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.linea, marginBottom: 14 },
  hojaTitulo: { marginBottom: 12 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.tarjeta,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  opcionActiva: { borderColor: colors.verde },
});
