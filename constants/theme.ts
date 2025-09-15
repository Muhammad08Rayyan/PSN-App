/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Official PSN Color Scheme from pakneurology.com
const primaryTeal = '#01a89e'; // Main brand teal color
const primaryOrange = '#f58020'; // Secondary brand orange
const darkGray = '#4F5655'; // Text color
const lightMintGreen = '#F3F6F3'; // Background accent
const slateGray = '#4B4F58'; // Secondary text
const lightGray = '#F6F7F8'; // Light background

export const Colors = {
  light: {
    text: '#010101',
    textSecondary: darkGray,
    background: '#FFFFFF',
    backgroundSecondary: lightMintGreen,
    tint: primaryTeal,
    primary: primaryTeal,
    secondary: slateGray,
    accent: primaryOrange,
    success: '#00AA44',
    warning: primaryOrange,
    error: '#DD3333',
    icon: darkGray,
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryTeal,
    border: '#E1E5E9',
    card: '#FFFFFF',
    notification: primaryOrange,
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    tint: '#1CBBB2', // Lighter teal for dark mode
    primary: '#1CBBB2',
    secondary: '#8E8E93',
    accent: '#FF9A4D', // Lighter orange for dark mode
    success: '#2ECC71',
    warning: '#F1C40F',
    error: '#E67E22',
    icon: '#8E8E93',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#1CBBB2',
    border: '#38383A',
    card: '#1C1C1E',
    notification: '#FF9A4D',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
