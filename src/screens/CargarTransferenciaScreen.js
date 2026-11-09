import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { File as ArchivoFS } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { apiFetch, mensajeError } from '../api';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { Aviso } from '../components/StateViews';
import T from '../components/T';
import { MAX_ARCHIVO_MB } from '../config';
import { esFechaValida, formatMoney, hoyISO, parseImporte } from '../format';
import { colors, radius } from '../theme';

const MAX_BYTES = MAX_ARCHIVO_MB * 1024 * 1024;

function bytesDeBase64(b64) {
  const relleno = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - relleno;
}

function tamañoLegible(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// Tipos que acepta POST /api/pagos/facturas/:id/comprobantes (el backend verifica el contenido).
const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'application/pdf'];

function tipoDeArchivo(nombre = '', mime) {
  if (mime === 'image/jpg') return 'image/jpeg';
  if (mime) return mime;
  if (/\.pdf$/i.test(nombre)) return 'application/pdf';
  if (/\.png$/i.test(nombre)) return 'image/png';
  if (/\.jpe?g$/i.test(nombre)) return 'image/jpeg';
  return null;
}

/** Escribe "20260310" como "2026-03-10" mientras se tipea. */
function mascaraFecha(texto) {
  const d = texto.replace(/\D/g, '').slice(0, 8);
  return [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join('-');
}

function importeInicial(valor) {
  const n = Number(valor);
  if (!n) return '';
  return n.toFixed(2).replace('.', ',').replace(/,00$/, '');
}

export default function CargarTransferenciaScreen({ navigation, route }) {
  const { facturaId, importe: importeSugerido } = route.params;
  const [archivo, setArchivo] = useState(null);
  const [importe, setImporte] = useState(importeInicial(importeSugerido));
  const [fecha, setFecha] = useState(hoyISO());
  const [operacion, setOperacion] = useState('');
  const [errorArchivo, setErrorArchivo] = useState(null);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(null);
  const [intentado, setIntentado] = useState(false);

  function aceptarArchivo({ uri, base64, tipo, nombre }) {
    if (!TIPOS_ACEPTADOS.includes(tipo)) {
      setErrorArchivo('El archivo tiene que ser una imagen JPG o PNG, o un PDF.');
      return;
    }
    const bytes = bytesDeBase64(base64);
    if (bytes > MAX_BYTES) {
      setErrorArchivo(`El archivo pesa ${tamañoLegible(bytes)}. El máximo es ${MAX_ARCHIVO_MB} MB.`);
      return;
    }
    setErrorArchivo(null);
    setArchivo({ uri, base64, tipo, nombre, bytes });
  }

  async function sacarFoto() {
    setErrorArchivo(null);
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      setErrorArchivo('Necesitamos permiso para usar la cámara. Podés habilitarlo desde los ajustes del teléfono.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5, base64: true });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const a = res.assets[0];
    aceptarArchivo({ uri: a.uri, base64: a.base64, tipo: a.mimeType ?? 'image/jpeg', nombre: a.fileName ?? 'foto.jpg' });
  }

  async function elegirArchivo() {
    setErrorArchivo(null);
    const res = await DocumentPicker.getDocumentAsync({
      type: TIPOS_ACEPTADOS,
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    if (a.size && a.size > MAX_BYTES) {
      setErrorArchivo(`El archivo pesa ${tamañoLegible(a.size)}. El máximo es ${MAX_ARCHIVO_MB} MB.`);
      return;
    }
    try {
      const base64 = await new ArchivoFS(a.uri).base64();
      aceptarArchivo({ uri: a.uri, base64, tipo: tipoDeArchivo(a.name, a.mimeType), nombre: a.name });
    } catch {
      setErrorArchivo('No pudimos leer el archivo. Probá con otro.');
    }
  }

  const importeNum = parseImporte(importe);
  const errores = {
    importe: !importe ? 'Ingresá el importe transferido.' : !(importeNum > 0) ? 'Importe inválido. Ej.: 12500,50' : null,
    fecha: !esFechaValida(fecha)
      ? 'Usá el formato AAAA-MM-DD.'
      : fecha > hoyISO()
        ? 'La fecha no puede ser futura.'
        : null,
    operacion: !operacion.trim() ? 'Ingresá el número de operación.' : null,
    archivo: !archivo ? 'Adjuntá el comprobante.' : null,
  };
  const valido = !Object.values(errores).some(Boolean);

  async function enviar() {
    setIntentado(true);
    if (!valido) return;
    setError(null);
    setEnviando(true);
    try {
      // Respuesta: { id, numero_operacion, importe, fecha_transferencia, estado_cuota,
      //   total_factura, pagado, saldo }
      const data = await apiFetch(`/api/pagos/facturas/${facturaId}/comprobantes`, {
        method: 'POST',
        body: JSON.stringify({
          numero_operacion: operacion.trim(),
          importe: importeNum,
          fecha_transferencia: fecha,
          archivo: archivo.base64,
          tipo: archivo.tipo,
        }),
      });
      setListo(
        data.estado_cuota === 'Pagada'
          ? `Registramos tu transferencia de ${formatMoney(data.importe)}. La cuota quedó pagada.`
          : `Registramos tu transferencia de ${formatMoney(data.importe)}. Llevás pagado ${formatMoney(
              data.pagado
            )} y queda un saldo de ${formatMoney(data.saldo)}.`
      );
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <Screen>
        <View style={styles.exito}>
          <View style={styles.exitoIcono}>
            <Ionicons name="checkmark" size={38} color={colors.blanco} />
          </View>
          <T v="h1" style={styles.centro}>¡Comprobante enviado!</T>
          <T v="body" style={[styles.centro, styles.exitoTexto]}>{listo}</T>
        </View>
        <Button titulo="Volver al inicio" onPress={() => navigation.popToTop()} />
      </Screen>
    );
  }

  const esPdf = archivo?.tipo === 'application/pdf';

  return (
    <Screen
      atras
      titulo="Cargar transferencia"
      footer={
        <View>
          <Aviso texto={error} />
          <Button titulo="Enviar comprobante" icono="send-outline" onPress={enviar} cargando={enviando} />
        </View>
      }
    >
      <T v="label" style={styles.label}>Comprobante</T>
      {archivo ? (
        <Card style={styles.preview}>
          {esPdf ? (
            <View style={styles.pdf}>
              <View style={styles.pdfIcono}>
                <Ionicons name="document-text-outline" size={30} color={colors.verde} />
              </View>
              <View style={{ flex: 1 }}>
                <T v="bodyStrong" numberOfLines={1}>{archivo.nombre}</T>
                <T v="small">PDF · {tamañoLegible(archivo.bytes)}</T>
              </View>
            </View>
          ) : (
            <>
              <Image source={{ uri: archivo.uri }} style={styles.imagen} resizeMode="cover" accessibilityLabel="Vista previa del comprobante" />
              <T v="small" style={styles.previewInfo}>Imagen · {tamañoLegible(archivo.bytes)}</T>
            </>
          )}
          <Pressable onPress={() => setArchivo(null)} hitSlop={8} style={styles.quitar} accessibilityRole="button">
            <Ionicons name="trash-outline" size={16} color={colors.rojo} />
            <T v="label" style={{ color: colors.rojo }}>Quitar</T>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.opciones}>
          <OpcionArchivo icono="camera-outline" titulo="Sacar foto" onPress={sacarFoto} />
          <OpcionArchivo icono="folder-open-outline" titulo="Elegir archivo" subtitulo="Imagen o PDF" onPress={elegirArchivo} />
        </View>
      )}
      {errorArchivo || (intentado && errores.archivo) ? (
        <T v="small" style={styles.error}>{errorArchivo || errores.archivo}</T>
      ) : (
        <T v="small" style={styles.ayuda}>Máximo {MAX_ARCHIVO_MB} MB.</T>
      )}

      <Field
        label="Importe transferido"
        value={importe}
        onChangeText={setImporte}
        placeholder="0"
        keyboardType="decimal-pad"
        error={intentado ? errores.importe : null}
        ayuda={importeNum > 0 ? formatMoney(importeNum) : null}
      />
      <Field
        label="Fecha de la transferencia"
        value={fecha}
        onChangeText={(t) => setFecha(mascaraFecha(t))}
        placeholder="AAAA-MM-DD"
        keyboardType="number-pad"
        maxLength={10}
        error={intentado || fecha.length === 10 ? errores.fecha : null}
      />
      <Field
        label="N.º de operación"
        value={operacion}
        onChangeText={setOperacion}
        placeholder="Figura en el comprobante del banco"
        autoCapitalize="characters"
        autoCorrect={false}
        error={intentado ? errores.operacion : null}
      />
    </Screen>
  );
}

function OpcionArchivo({ icono, titulo, subtitulo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.opcion, pressed && { backgroundColor: colors.verdeClaro }]}
    >
      <View style={styles.opcionIcono}>
        <Ionicons name={icono} size={26} color={colors.verde} />
      </View>
      <T v="bodyStrong">{titulo}</T>
      {subtitulo ? <T v="small">{subtitulo}</T> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 8 },
  opciones: { flexDirection: 'row', gap: 12 },
  opcion: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.verde,
    backgroundColor: colors.tarjeta,
  },
  opcionIcono: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  preview: { padding: 12 },
  imagen: { width: '100%', height: 220, borderRadius: radius.sm, backgroundColor: colors.fondo },
  previewInfo: { marginTop: 8 },
  pdf: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pdfIcono: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitar: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginTop: 8 },
  error: { color: colors.rojo, marginTop: 8, marginBottom: 18 },
  ayuda: { marginTop: 8, marginBottom: 18 },
  exito: { alignItems: 'center', marginTop: 48, marginBottom: 28 },
  exitoIcono: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exitoTexto: { color: colors.textoSecundario, marginTop: 8 },
  centro: { textAlign: 'center' },
});
