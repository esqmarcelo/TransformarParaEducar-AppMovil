import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBar from '../components/TabBar';
import CuotasScreen from '../screens/CuotasScreen';
import HistorialScreen from '../screens/HistorialScreen';
import InscripcionesScreen from '../screens/InscripcionesScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.fondo },
      }}
    >
      <Tab.Screen name="Cuotas" component={CuotasScreen} />
      <Tab.Screen name="Inscripciones" component={InscripcionesScreen} />
      <Tab.Screen name="Historial" component={HistorialScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
