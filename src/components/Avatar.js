import { StyleSheet, View } from 'react-native';
import { colors, fonts } from '../theme';
import { iniciales } from '../format';
import T from './T';

export default function Avatar({ nombre, apellido, size = 46, fondo = colors.verdeClaro, color = colors.verdeOscuro }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: fondo }]}>
      <T style={[styles.texto, { fontSize: size * 0.38, color }]}>{iniciales(nombre, apellido)}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  texto: { fontFamily: fonts.tituloBold },
});
