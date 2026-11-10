import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { HijoProvider } from '../context/HijoContext';
import CambiarPasswordScreen from '../screens/CambiarPasswordScreen';
import CargarTransferenciaScreen from '../screens/CargarTransferenciaScreen';
import ComprobanteScreen from '../screens/ComprobanteScreen';
import ElegirItemsScreen from '../screens/ElegirItemsScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificacionesScreen from '../screens/NotificacionesScreen';
import RecuperarPasswordScreen from '../screens/RecuperarPasswordScreen';
import { colors } from '../theme';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

const opciones = { headerShown: false, contentStyle: { backgroundColor: colors.fondo } };

function AppStack() {
  // El hijo elegido se comparte entre las pestañas y las pantallas de pago.
  return (
    <HijoProvider>
      <Stack.Navigator screenOptions={opciones}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ElegirItems" component={ElegirItemsScreen} />
        <Stack.Screen name="Comprobante" component={ComprobanteScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="CargarTransferencia" component={CargarTransferenciaScreen} />
        <Stack.Screen name="CambiarPassword" component={CambiarPasswordScreen} />
        <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
      </Stack.Navigator>
    </HijoProvider>
  );
}

const Root = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, cargando } = useAuth();

  // Mientras se lee la sesión guardada.
  if (cargando) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.verdeClaro} />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={opciones}>
      {user ? (
        <Root.Screen name="App" component={AppStack} />
      ) : (
        <>
          <Root.Screen name="Login" component={LoginScreen} />
          <Root.Screen name="RecuperarPassword" component={RecuperarPasswordScreen} />
        </>
      )}
    </Root.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tinta },
});
