import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Field from '../components/Field';
import { Aviso } from '../components/StateViews';
import T from '../components/T';
import { useAuth } from '../context/AuthContext';
import { APP_NOMBRE, colors, radius, shadow } from '../theme';

const logo = require('../../assets/logo.png');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const puedeEnviar = email.trim() !== '' && password !== '' && !enviando;

  async function handleLogin() {
    if (!puedeEnviar) return;
    setError(null);
    setEnviando(true);
    try {
      await login(email.trim(), password);
      // Si sale bien, el navegador cambia solo a las pestañas.
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.raiz} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[styles.cabecera, { paddingTop: insets.top + 36 }]}>
          <View style={styles.logoCaja}>
            <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel={`Logo de ${APP_NOMBRE}`} />
          </View>
          <T v="display" style={styles.nombre}>{APP_NOMBRE}</T>
          <T v="body" style={styles.lema}>Cuotas y servicios de tus hijos, en un lugar</T>
        </View>

        <View style={[styles.hoja, { paddingBottom: insets.bottom + 28 }]}>
          <T v="h2" style={styles.hojaTitulo}>Ingresá a tu cuenta</T>
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
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <Field
            ref={passwordRef}
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña"
            password
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            style={styles.ultimoCampo}
          />

          <Pressable
            onPress={() => navigation.navigate('RecuperarPassword', { email: email.trim() })}
            hitSlop={10}
            accessibilityRole="link"
            style={styles.olvido}
          >
            <T v="label" style={styles.olvidoTexto}>¿Olvidaste tu contraseña?</T>
          </Pressable>

          <Button titulo="Ingresar" onPress={handleLogin} cargando={enviando} disabled={!puedeEnviar && !enviando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colors.tinta },
  scroll: { flexGrow: 1 },
  cabecera: { alignItems: 'center', paddingHorizontal: 28, paddingBottom: 36 },
  logoCaja: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.blanco,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 20,
    ...shadow.media,
  },
  logo: { width: '100%', height: '100%' },
  nombre: { color: colors.blanco, textAlign: 'center' },
  lema: { color: '#B9CCC4', textAlign: 'center', marginTop: 8 },
  hoja: {
    flexGrow: 1,
    backgroundColor: colors.fondo,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  hojaTitulo: { marginBottom: 18 },
  ultimoCampo: { marginBottom: 10 },
  olvido: { alignSelf: 'flex-end', marginBottom: 22 },
  olvidoTexto: { color: colors.verde },
});
