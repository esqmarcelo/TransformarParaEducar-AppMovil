import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { apiFetch } from '../api';
import Badge from '../components/Badge';
import Card from '../components/Card';
import HijoSelector, { RequiereHijo } from '../components/HijoSelector';
import Screen from '../components/Screen';
import { Cargando, ErrorView } from '../components/StateViews';
import T from '../components/T';
import { MAX_DEPORTES } from '../config';
import { useHijo } from '../context/HijoContext';
import { useApi } from '../hooks/useApi';
import { colors, radius } from '../theme';

export default function InscripcionesScreen() {
  const { hijo, recargar: recargarHijos } = useHijo();
  const { data, cargando, refrescando, error, recargar } = useApi(
    () => apiFetch(`/api/servicios/alumnos/${hijo.id}`),
    [hijo?.id],
    { enabled: Boolean(hijo) }
  );

  return (
    <Screen
      conTabBar
      titulo="Inscripciones"
      onRefresh={() => (hijo ? recargar({ silencioso: true }) : recargarHijos())}
      refrescando={refrescando}
    >
      <RequiereHijo>
        {() => (
          <>
            <HijoSelector />
            {cargando ? (
              <Cargando />
            ) : error ? (
              <ErrorView error={error} onRetry={recargar} />
            ) : data ? (
              <Servicios servicios={data} />
            ) : null}
          </>
        )}
      </RequiereHijo>
    </Screen>
  );
}

function Servicios({ servicios }) {
  const deportes = Array.isArray(servicios.deportes) ? servicios.deportes : [];
  const { transporte, comedor } = servicios;

  return (
    <>
      <Seccion titulo="Deportes" extra={`${deportes.length} de ${MAX_DEPORTES}`}>
        {deportes.length === 0 ? (
          <TarjetaServicio icono="basketball-outline" titulo="Sin deportes" detalle="No está inscripto en ningún deporte." inactiva />
        ) : (
          deportes.map((d) => (
            <TarjetaServicio
              key={d.id}
              icono="basketball-outline"
              titulo={d.nombre}
              detalle={[d.nivel || 'Todos los niveles', d.dia && `${d.dia} ${d.hora_inicio ?? ''} a ${d.hora_fin ?? ''}`]
                .filter(Boolean)
                .join(' · ')}
              estado="Activa"
            />
          ))
        )}
      </Seccion>

      <Seccion titulo="Transporte">
        {transporte ? (
          <TarjetaServicio icono="bus-outline" titulo={transporte.recorrido_nombre || 'Recorrido'} detalle="Recorrido asignado" estado="Activa" />
        ) : (
          <TarjetaServicio icono="bus-outline" titulo="Sin transporte" detalle="No usa el transporte escolar." inactiva />
        )}
      </Seccion>

      <Seccion titulo="Comedor">
        {comedor ? (
          <TarjetaServicio icono="restaurant-outline" titulo="Comedor escolar" detalle="Almuerza en el colegio" estado="Inscripto" />
        ) : (
          <TarjetaServicio icono="restaurant-outline" titulo="Sin comedor" detalle="No está inscripto en el comedor." inactiva />
        )}
      </Seccion>

      <View style={styles.nota}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textoSecundario} />
        <T v="small" style={{ flex: 1 }}>Para inscribir o dar de baja un servicio, comunicate con la administración del colegio.</T>
      </View>
    </>
  );
}

function Seccion({ titulo, extra, children }) {
  return (
    <View style={styles.seccion}>
      <View style={styles.seccionCabecera}>
        <T v="h2">{titulo}</T>
        {extra ? <T v="label" style={styles.extra}>{extra}</T> : null}
      </View>
      {children}
    </View>
  );
}

function TarjetaServicio({ icono, titulo, detalle, estado, inactiva = false }) {
  return (
    <Card style={[styles.tarjeta, inactiva && styles.tarjetaInactiva]}>
      <View style={[styles.icono, inactiva && styles.iconoInactivo]}>
        <Ionicons name={icono} size={22} color={inactiva ? colors.textoSecundario : colors.verde} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="bodyStrong">{titulo}</T>
        {detalle ? <T v="small">{detalle}</T> : null}
      </View>
      <Badge texto={inactiva ? 'No inscripto' : estado} tono={inactiva ? 'neutro' : 'ok'} />
    </Card>
  );
}

const styles = StyleSheet.create({
  seccion: { marginBottom: 22 },
  seccionCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  extra: { color: colors.verde },
  tarjeta: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10, borderRadius: radius.md },
  tarjetaInactiva: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.linea, borderStyle: 'dashed', boxShadow: 'none' },
  icono: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoInactivo: { backgroundColor: '#EEEBE3' },
  nota: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
