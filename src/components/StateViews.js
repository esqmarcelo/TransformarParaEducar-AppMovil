import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';
import Button from './Button';
import T from './T';

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colors.verde} />
      <T v="small" style={styles.texto}>{texto}</T>
    </View>
  );
}

function Mensaje({ icono, tono = colors.verde, fondo = colors.verdeClaro, titulo, texto, children }) {
  return (
    <View style={styles.centro}>
      <View style={[styles.icono, { backgroundColor: fondo }]}>
        <Ionicons name={icono} size={30} color={tono} />
      </View>
      <T v="h3" style={styles.titulo}>{titulo}</T>
      {texto ? <T v="small" style={styles.texto}>{texto}</T> : null}
      {children}
    </View>
  );
}

/** Error con "Reintentar". Si la ruta no existe aún en el servidor muestra "Disponible pronto". */
export function ErrorView({ error, onRetry }) {
  if (error?.noDisponible) {
    return (
      <Mensaje
        icono="construct-outline"
        titulo="Disponible pronto"
        texto="Esta sección todavía no está habilitada. Estamos trabajando para sumarla."
      />
    );
  }
  return (
    <Mensaje
      icono="cloud-offline-outline"
      tono={colors.rojo}
      fondo={colors.rojoFondo}
      titulo="No pudimos cargar la información"
      texto={error?.message}
    >
      {onRetry ? (
        <Button titulo="Reintentar" variante="secundario" icono="refresh" onPress={() => onRetry()} style={styles.boton} />
      ) : null}
    </Mensaje>
  );
}

export function Vacio({ icono = 'file-tray-outline', titulo, texto }) {
  return <Mensaje icono={icono} tono={colors.textoSecundario} fondo="#EEEBE3" titulo={titulo} texto={texto} />;
}

/** Aviso en línea (por ejemplo, el resultado de enviar un formulario). */
export function Aviso({ tipo = 'error', texto }) {
  if (!texto) return null;
  const esOk = tipo === 'ok';
  return (
    <View style={[styles.aviso, { backgroundColor: esOk ? colors.verdeClaro : colors.rojoFondo }]}>
      <Ionicons
        name={esOk ? 'checkmark-circle' : 'alert-circle'}
        size={20}
        color={esOk ? colors.verdeOscuro : colors.rojo}
      />
      <T v="label" style={[styles.avisoTexto, { color: esOk ? colors.verdeOscuro : colors.rojo }]}>
        {texto}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  icono: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  titulo: { textAlign: 'center' },
  texto: { textAlign: 'center', marginTop: 6 },
  boton: { marginTop: 18, alignSelf: 'stretch' },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: radius.sm,
    marginBottom: 16,
  },
  avisoTexto: { flex: 1 },
});
