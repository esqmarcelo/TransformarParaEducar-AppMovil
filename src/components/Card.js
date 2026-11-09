import { StyleSheet, View } from 'react-native';
import { colors, radius, shadow } from '../theme';

export default function Card({ style, children, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tarjeta,
    borderRadius: radius.lg,
    padding: 18,
    ...shadow.suave,
  },
});
