import {
  DefaultTheme as NavigationDefaultTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  adaptNavigationTheme,
  MD3LightTheme,
  type MD3Theme,
} from 'react-native-paper';

import { colors } from '@/theme/colors';

export const paperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: colors.primaryMuted,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.primaryDark,
    onSecondary: '#FFFFFF',
    secondaryContainer: colors.primaryMuted,
    onSecondaryContainer: colors.primaryDark,
    tertiary: colors.success,
    onTertiary: '#FFFFFF',
    tertiaryContainer: colors.successMuted,
    onTertiaryContainer: colors.success,
    error: colors.danger,
    onError: '#FFFFFF',
    errorContainer: colors.dangerMuted,
    onErrorContainer: colors.danger,
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.primaryMuted,
    onSurfaceVariant: colors.textMuted,
    outline: colors.border,
    outlineVariant: colors.border,
    inverseSurface: colors.primaryDark,
    inverseOnSurface: '#E8F6EF',
    inversePrimary: '#8FD4B0',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
};

const { LightTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  materialLight: paperTheme,
});

export const navigationTheme: NavigationTheme = {
  ...NavigationDefaultTheme,
  ...LightTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...LightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};
