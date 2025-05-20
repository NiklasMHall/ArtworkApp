import { MD3DarkTheme, MD3LightTheme, MD3Theme } from 'react-native-paper';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { colors } from './colors';

const customLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onSurface: colors.light.mainText,
    onSurfaceVariant: colors.light.secondaryText,
  },
};

const customDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    onSurface: colors.dark.mainText,
    onSurfaceVariant: colors.dark.secondaryText,
  },
};

export const getTheme = (isDark: boolean) => ({
  ...isDark ? customDarkTheme : customLightTheme,
});

export const getNavigationTheme = (isDark: boolean): Theme => ({
  ...(isDark ? DarkTheme : DefaultTheme),
  colors: {
    ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
    primary: isDark ? colors.dark.primary : colors.light.primary,
    background: isDark ? colors.dark.background : colors.light.background,
    card: isDark ? colors.dark.surface : colors.light.surface,
    text: isDark ? colors.dark.mainText : colors.light.mainText,
    border: isDark ? colors.dark.border : colors.light.border,
    notification: isDark ? colors.dark.primary : colors.light.primary,
  },
});