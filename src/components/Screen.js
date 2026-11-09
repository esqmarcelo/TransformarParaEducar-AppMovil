import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, TAB_BAR } from '../theme';
import T from './T';

/** Espacio inferior para que la barra flotante no tape el contenido. */
export function useEspacioTabBar() {
  const insets = useSafeAreaInsets();
  return TAB_BAR.alto + TAB_BAR.margenInferior + Math.max(insets.bottom - 8, 0) + 20;
}

/**
 * Pantalla base: título grande, scroll y espacio para la barra inferior.
 * - conTabBar: deja lugar para la barra flotante (pantallas de pestañas).
 * - atras: muestra el botón para volver (pantallas del stack).
 * - footer: contenido fijo abajo (por ejemplo, total y botón).
 */
export default function Screen({
  titulo,
  subtitulo,
  atras = false,
  conTabBar = false,
  onRefresh,
  refrescando = false,
  footer,
  children,
  contentStyle,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const espacioTabBar = useEspacioTabBar();
  const paddingBottom = footer ? 24 : conTabBar ? espacioTabBar : insets.bottom + 24;

  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.raiz}
        contentContainerStyle={[{ paddingTop: insets.top + 12, paddingBottom }, styles.contenido, contentStyle]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={colors.verde} colors={[colors.verde]} />
          ) : undefined
        }
      >
        {atras ? (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.atras, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.tinta} />
          </Pressable>
        ) : null}
        {subtitulo ? <T v="small" style={styles.subtitulo}>{subtitulo}</T> : null}
        {titulo ? <T v="h1" style={styles.titulo}>{titulo}</T> : null}
        {children}
      </ScrollView>
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colors.fondo },
  contenido: { paddingHorizontal: 20 },
  atras: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tarjeta,
    borderWidth: 1,
    borderColor: colors.linea,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  subtitulo: { marginBottom: 2 },
  titulo: { marginBottom: 18 },
  footer: {
    backgroundColor: colors.tarjeta,
    borderTopWidth: 1,
    borderTopColor: colors.linea,
    paddingHorizontal: 20,
    paddingTop: 14,
    boxShadow: '0px -6px 20px rgba(16, 49, 42, 0.06)',
  },
});
