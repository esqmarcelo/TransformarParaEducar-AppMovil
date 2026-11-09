import { useState } from 'react';
import { apiFetch, mensajeError } from '../api';
import Button from '../components/Button';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { Aviso } from '../components/StateViews';

const MIN_PASSWORD = 6;

export default function CambiarPasswordScreen({ navigation }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);

  const errorNueva =
    nueva && nueva.length < MIN_PASSWORD
      ? `Mínimo ${MIN_PASSWORD} caracteres.`
      : nueva && nueva === actual
        ? 'Tiene que ser distinta de la actual.'
        : null;
  const errorRepetir = repetir && repetir !== nueva ? 'Las contraseñas no coinciden.' : null;
  const valido = actual && nueva.length >= MIN_PASSWORD && nueva !== actual && repetir === nueva;

  async function guardar() {
    if (!valido) return;
    setError(null);
    setEnviando(true);
    try {
      const data = await apiFetch('/api/auth/cambiar-password', {
        method: 'POST',
        body: JSON.stringify({ actual, nueva }),
      });
      // Respuesta: { message: 'Contraseña actualizada.' }. Errores de datos: 400 con message.
      setOk(data?.message || 'Tu contraseña fue actualizada.');
      setActual('');
      setNueva('');
      setRepetir('');
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen atras titulo="Cambiar contraseña">
      <Aviso tipo="ok" texto={ok} />
      <Aviso texto={error} />
      {ok ? (
        <Button titulo="Volver al perfil" onPress={() => navigation.goBack()} />
      ) : (
        <>
          <Field
            label="Contraseña actual"
            value={actual}
            onChangeText={setActual}
            password
            autoComplete="current-password"
            textContentType="password"
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
            label="Repetir contraseña nueva"
            value={repetir}
            onChangeText={setRepetir}
            password
            autoComplete="new-password"
            textContentType="newPassword"
            error={errorRepetir}
          />
          <Button titulo="Guardar contraseña" onPress={guardar} cargando={enviando} disabled={!valido && !enviando} />
        </>
      )}
    </Screen>
  );
}
