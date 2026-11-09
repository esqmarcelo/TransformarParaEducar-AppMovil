import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { apiFetch, mensajeError } from '../api';
import Button from '../components/Button';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { Aviso } from '../components/StateViews';
import T from '../components/T';
import { colors, fonts } from '../theme';

const MIN_PASSWORD = 6;

export default function RecuperarPasswordScreen({ navigation, route }) {
  const [paso, setPaso] = useState(1);
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [codigo, setCodigo] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [listo, setListo] = useState(false);

  async function enviarCodigo() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Ingresá un email válido.');
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      const data = await apiFetch('/api/auth/recuperar', {
        method: 'POST',
        publica: true,
        body: JSON.stringify({ email: email.trim() }),
      });
      setInfo(data?.message || `Si el email está registrado, te enviamos un código a ${email.trim()}.`);
      setPaso(2);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  }

  const errorCodigo = codigo && !/^\d{6}$/.test(codigo) ? 'El código tiene 6 dígitos.' : null;
  const errorNueva = nueva && nueva.length < MIN_PASSWORD ? `Mínimo ${MIN_PASSWORD} caracteres.` : null;
  const errorRepetir = repetir && repetir !== nueva ? 'Las contraseñas no coinciden.' : null;
  const puedeRestablecer =
    /^\d{6}$/.test(codigo) && nueva.length >= MIN_PASSWORD && repetir === nueva && !enviando;

  async function restablecer() {
    if (!puedeRestablecer) return;
    setError(null);
    setEnviando(true);
    try {
      const data = await apiFetch('/api/auth/restablecer', {
        method: 'POST',
        publica: true,
        body: JSON.stringify({ email: email.trim(), codigo, nueva }),
      });
      setInfo(data?.message || 'Listo, tu contraseña fue actualizada. Ya podés ingresar.');
      setListo(true);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen atras titulo="Recuperar contraseña">
      <View style={styles.pasos}>
        {[1, 2].map((n) => (
          <View key={n} style={[styles.paso, paso >= n && styles.pasoActivo]} />
        ))}
      </View>

      {listo ? (
        <>
          <Aviso tipo="ok" texto={info} />
          <Button titulo="Volver a ingresar" onPress={() => navigation.goBack()} />
        </>
      ) : paso === 1 ? (
        <>
          <T v="body" style={styles.intro}>
            Ingresá el email de tu cuenta y te enviamos un código de 6 dígitos para crear una contraseña nueva.
          </T>
          <Aviso texto={error} />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={enviarCodigo}
          />
          <Button titulo="Enviar código" onPress={enviarCodigo} cargando={enviando} />
        </>
      ) : (
        <>
          <Aviso tipo="ok" texto={info} />
          <Aviso texto={error} />
          <Field
            label="Código"
            value={codigo}
            onChangeText={(t) => setCodigo(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={6}
            error={errorCodigo}
            style={styles.campoCodigo}
          />
          <Field
            label="Contraseña nueva"
            value={nueva}
            onChangeText={setNueva}
            password
            autoComplete="new-password"
            textContentType="newPassword"
            error={errorNueva}
            ayuda={`Mínimo ${MIN_PASSWORD} caracteres.`}
          />
          <Field
            label="Repetir contraseña"
            value={repetir}
            onChangeText={setRepetir}
            password
            autoComplete="new-password"
            textContentType="newPassword"
            error={errorRepetir}
          />
          <Button titulo="Cambiar contraseña" onPress={restablecer} cargando={enviando} disabled={!puedeRestablecer && !enviando} />
          <Button
            titulo="Reenviar código"
            variante="secundario"
            onPress={() => {
              setPaso(1);
              setInfo(null);
              setError(null);
            }}
            style={styles.reenviar}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  pasos: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  paso: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.linea },
  pasoActivo: { backgroundColor: colors.verde },
  intro: { color: colors.textoSecundario, marginBottom: 18, fontFamily: fonts.regular },
  campoCodigo: {},
  reenviar: { marginTop: 12 },
});
