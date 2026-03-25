export const Colors = {
  // Primary palette
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',

  // Accent
  accent: '#FD79A8',
  accentLight: '#FFAECF',

  // Background
  bgDark: '#0F0F1E',
  bgCard: '#1A1A2E',
  bgCardLight: '#16213E',
  bgInput: '#1E1E35',

  // Glass
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B2BEFF',
  textMuted: '#6B7FCC',
  textDark: '#0F0F1E',

  // Status
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E17055',

  // Mood colors
  mood1: '#E17055', // Very bad - red
  mood2: '#FDCB6E', // Bad - yellow
  mood3: '#74B9FF', // Neutral - blue
  mood4: '#55EFC4', // Good - teal
  mood5: '#A29BFE', // Great - purple

  // Tab bar
  tabActive: '#A29BFE',
  tabInactive: '#4A4A6A',
  tabBar: '#12122A',
};

export const Gradients = {
  primary: ['#6C5CE7', '#4834D4'] as [string, string],
  background: ['#0F0F1E', '#1A1A2E'] as [string, string],
  card: ['#1A1A2E', '#16213E'] as [string, string],
  accent: ['#FD79A8', '#E84393'] as [string, string],
  aurora: ['#6C5CE7', '#FD79A8', '#FDCB6E'] as [string, string, string],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: '#FFFFFF' },
  h2: { fontSize: 22, fontWeight: '600' as const, color: '#FFFFFF' },
  h3: { fontSize: 18, fontWeight: '600' as const, color: '#FFFFFF' },
  body: { fontSize: 15, fontWeight: '400' as const, color: '#FFFFFF' },
  caption: { fontSize: 12, fontWeight: '400' as const, color: '#B2BEFF' },
  small: { fontSize: 11, fontWeight: '400' as const, color: '#6B7FCC' },
};
