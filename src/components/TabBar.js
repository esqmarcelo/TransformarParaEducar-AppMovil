import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, TAB_BAR } from '../theme';

const PADDING = 6;
// La pestaña activa ocupa este múltiplo del ancho de una inactiva.
const FACTOR_ACTIVA = 2.7;

export const ICONOS_TAB = {
  Cuotas: 'card-outline',
  Inscripciones: 'checkbox-outline',
  Historial: 'time-outline',
  Perfil: 'person-outline',
};

/**
 * Barra inferior flotante. Una pastilla verde claro se desliza (spring) hasta la
 * pestaña activa, que muestra ícono + nombre; las demás, solo ícono.
 */
export default function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [ancho, setAncho] = useState(0);
  const pos = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(pos, {
      toValue: state.index,
      useNativeDriver: false, // se animan anchos, que no soporta el driver nativo
      damping: 17,
      stiffness: 190,
      mass: 0.9,
    }).start();
  }, [state.index, pos]);

  const n = state.routes.length;
  const unidad = ancho > 0 ? (ancho - PADDING * 2) / (n - 1 + FACTOR_ACTIVA) : 0;
  const altoPastilla = TAB_BAR.alto - PADDING * 2;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.contenedor, { bottom: TAB_BAR.margenInferior + Math.max(insets.bottom - 8, 0) }]}
    >
      <View style={styles.barra} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
        {unidad > 0 ? (
          <>
            <Animated.View
              style={[
                styles.pastilla,
                {
                  width: unidad * FACTOR_ACTIVA,
                  height: altoPastilla,
                  transform: [
                    {
                      translateX: pos.interpolate({
                        inputRange: [0, 1],
                        outputRange: [PADDING, PADDING + unidad],
                        extrapolate: 'extend',
                      }),
                    },
                  ],
                },
              ]}
            />
            {state.routes.map((route, i) => {
              const { options } = descriptors[route.key];
              const etiqueta = options.tabBarLabel ?? options.title ?? route.name;
              const activa = state.index === i;
              const rango = [i - 1, i, i + 1];
              const ancho_i = pos.interpolate({
                inputRange: rango,
                outputRange: [unidad, unidad * FACTOR_ACTIVA, unidad],
                extrapolate: 'clamp',
              });
              const opacidad = pos.interpolate({ inputRange: rango, outputRange: [0, 1, 0], extrapolate: 'clamp' });
              const anchoTexto = pos.interpolate({ inputRange: rango, outputRange: [0, 110, 0], extrapolate: 'clamp' });

              const onPress = () => {
                const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!activa && !evento.defaultPrevented) navigation.navigate(route.name, route.params);
              };

              return (
                <Animated.View key={route.key} style={{ width: ancho_i, height: altoPastilla }}>
                  <Pressable
                    onPress={onPress}
                    onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: activa }}
                    accessibilityLabel={etiqueta}
                    style={styles.tab}
                  >
                    <Ionicons
                      name={ICONOS_TAB[route.name] ?? 'ellipse-outline'}
                      size={22}
                      color={activa ? colors.verdeOscuro : colors.tabInactivo}
                    />
                    <Animated.Text
                      numberOfLines={1}
                      style={[styles.etiqueta, { opacity: opacidad, maxWidth: anchoTexto }]}
                    >
                      {etiqueta}
                    </Animated.Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { position: 'absolute', left: TAB_BAR.margenLateral, right: TAB_BAR.margenLateral },
  barra: {
    height: TAB_BAR.alto,
    borderRadius: radius.full,
    backgroundColor: colors.tinta,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    ...shadow.media,
  },
  pastilla: {
    position: 'absolute',
    left: 0,
    top: PADDING,
    borderRadius: radius.full,
    backgroundColor: colors.verdeClaro,
  },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  etiqueta: { fontFamily: fonts.bold, fontSize: 13, color: colors.verdeOscuro },
});
