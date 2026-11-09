import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '../theme';
import T from './T';

/** Campo de texto con etiqueta, ayuda/error y ojo opcional para contraseñas. */
const Field = forwardRef(function Field(
  { label, error, ayuda, password = false, style, onFocus, onBlur, autoCapitalize, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [foco, setFoco] = useState(false);

  return (
    <View style={[styles.contenedor, style]}>
      {label ? <T v="label" style={styles.label}>{label}</T> : null}
      <View
        style={[
          styles.caja,
          foco && styles.cajaFoco,
          error && styles.cajaError,
        ]}
      >
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor="#98A39F"
          secureTextEntry={password && !visible}
          {...props}
          autoCapitalize={password ? 'none' : autoCapitalize}
          onFocus={(e) => {
            setFoco(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            onBlur?.(e);
          }}
        />
        {password ? (
          <Pressable
            onPress={() => setVisible((x) => !x)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={styles.ojo}
          >
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textoSecundario} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <T v="small" style={styles.error}>{error}</T>
      ) : ayuda ? (
        <T v="small" style={styles.ayuda}>{ayuda}</T>
      ) : null}
    </View>
  );
});

export default Field;

const styles = StyleSheet.create({
  contenedor: { marginBottom: 16 },
  label: { marginBottom: 6 },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.linea,
    backgroundColor: colors.tarjeta,
  },
  cajaFoco: { borderColor: colors.verde },
  cajaError: { borderColor: colors.rojo },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.tinta,
  },
  ojo: { paddingHorizontal: 14, height: '100%', justifyContent: 'center' },
  error: { color: colors.rojo, marginTop: 6 },
  ayuda: { marginTop: 6 },
});
