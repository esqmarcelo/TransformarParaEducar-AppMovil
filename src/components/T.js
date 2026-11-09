import { Text } from 'react-native';
import { type } from '../theme';

/** Texto con los estilos tipográficos del tema: <T v="h1">Título</T> */
export default function T({ v = 'body', style, ...props }) {
  return <Text style={[type[v], style]} {...props} />;
}
