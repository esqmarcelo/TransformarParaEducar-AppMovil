import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { Cargando, ErrorView } from '../components/StateViews';
import T from '../components/T';
import { useAuth } from '../context/AuthContext';
import { useHijo } from '../context/HijoContext';
import { colors, radius } from '../theme';

export default function PerfilScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { hijos, cargando, error, recargar } = useHijo();

  return (
    <Screen conTabBar titulo="Perfil">
      <Card style={styles.usuario}>
        <Avatar nombre={user?.nombre} apellido={user?.apellido} size={64} fondo={colors.tinta} color={colors.verdeClaro} />
        <View style={{ flex: 1 }}>
          <T v="h2" numberOfLines={2}>{user?.nombre} {user?.apellido}</T>
          {user?.email ? <T v="small" numberOfLines={1}>{user.email}</T> : null}
        </View>
      </Card>

      <T v="h2" style={styles.seccion}>Mis hijos</T>
      {cargando ? (
        <Cargando />
      ) : error ? (
        <ErrorView error={error} onRetry={recargar} />
      ) : hijos.length === 0 ? (
        <Card><T v="small">Todavía no hay alumnos vinculados a tu cuenta.</T></Card>
      ) : (
        <Card style={styles.lista}>
          {hijos.map((h, i) => (
            <View key={h.id} style={[styles.hijo, i < hijos.length - 1 && styles.borde]}>
              <Avatar nombre={h.nombre} apellido={h.apellido} size={40} />
              <View style={{ flex: 1 }}>
                <T v="bodyStrong">{h.nombre} {h.apellido}</T>
                <T v="small">{h.curso_nombre || 'Sin curso asignado'}</T>
              </View>
            </View>
          ))}
        </Card>
      )}

      <T v="h2" style={styles.seccion}>Cuenta</T>
      <Card style={styles.lista}>
        <Pressable
          onPress={() => navigation.navigate('CambiarPassword')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.opcion, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.opcionIcono}>
            <Ionicons name="key-outline" size={20} color={colors.verde} />
          </View>
          <T v="bodyStrong" style={{ flex: 1 }}>Cambiar contraseña</T>
          <Ionicons name="chevron-forward" size={20} color={colors.textoSecundario} />
        </Pressable>
      </Card>

      <Button titulo="Cerrar sesión" variante="peligro" icono="log-out-outline" onPress={logout} style={styles.salir} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  usuario: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  seccion: { marginTop: 26, marginBottom: 12 },
  lista: { paddingVertical: 4 },
  hijo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  borde: { borderBottomWidth: 1, borderBottomColor: colors.linea },
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  opcionIcono: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salir: { marginTop: 28 },
});
