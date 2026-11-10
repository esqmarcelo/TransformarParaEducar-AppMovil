export const APP_NOMBRE = 'Educar Para Transformar';

export const colors = {
  tinta: '#10312A',
  verde: '#0B7A55',
  verdeOscuro: '#075C40',
  verdeClaro: '#DDF2E6',
  fondo: '#F5F3EE',
  tarjeta: '#FFFFFF',
  linea: '#E6E2D8',
  textoSecundario: '#5B6B66',
  ambar: '#B4560B',
  ambarFondo: '#FCEBD7',
  rojo: '#B42318',
  rojoFondo: '#FBE4E1',
  azul: '#1F4FA8',
  azulFondo: '#E3EBFA',
  tabInactivo: '#B9CCC4',
  blanco: '#FFFFFF',
};

// Nombres tal como los registra useFonts en App.js.
export const fonts = {
  titulo: 'BricolageGrotesque_800ExtraBold',
  tituloBold: 'BricolageGrotesque_700Bold',
  regular: 'Figtree_400Regular',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
};

export const radius = { sm: 14, md: 18, lg: 24, full: 999 };

export const shadow = {
  suave: { boxShadow: '0px 4px 16px rgba(16, 49, 42, 0.07)' },
  media: { boxShadow: '0px 10px 28px rgba(16, 49, 42, 0.14)' },
};

export const ALTO_BOTON = 54;

// Barra inferior flotante (ver components/TabBar.js).
export const TAB_BAR = { alto: 64, margenLateral: 20, margenInferior: 24 };

// Estilos de texto. Con fuentes propias no se usa fontWeight: el peso lo da la familia.
export const type = {
  display: { fontFamily: fonts.titulo, fontSize: 32, lineHeight: 38, color: colors.tinta, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.titulo, fontSize: 28, lineHeight: 34, color: colors.tinta, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.tituloBold, fontSize: 20, lineHeight: 26, color: colors.tinta },
  h3: { fontFamily: fonts.tituloBold, fontSize: 17, lineHeight: 22, color: colors.tinta },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.tinta },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.tinta },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.tinta },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textoSecundario },
  overline: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textoSecundario,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  money: { fontFamily: fonts.tituloBold, fontSize: 17, color: colors.tinta, fontVariant: ['tabular-nums'] },
  moneyLg: {
    fontFamily: fonts.titulo,
    fontSize: 40,
    lineHeight: 46,
    color: colors.tinta,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.8,
  },
};
