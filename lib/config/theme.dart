import 'package:flutter/material.dart';

/// Updated app palette based on the new brand colors.
class AppColors {
  AppColors._();

  // Brand accent (shared across both modes)
  static const primaryMint = Color(0xFF26D98F);
  static const accentGold = Color(0xFFFFCF10);
  static const accentRed = Color(0xFFFF2A3B);
  static const accentBlue = Color(0xFF1A83FA);
  static const brandPink = Color(0xFFFF2D78);

  // Legacy aliases used across the app for compatibility
  static const primary = primaryMint;
  static const primaryDeep = primaryMint;
  static const accent = primaryMint;
  static const accentSoft = Color(0xFF9BEFCE);
  static const gold = accentGold;
  static const purple = accentBlue;
  static const cyan = accentBlue;
  static const online = primaryMint;
  static const error = accentRed;

  // Dark mode colors
  static const darkBackground = Color(0xFF0D1715);
  static const darkSurface = Color(0xFF172320);
  static const darkBorder = Color(0xFF2C423D);
  static const darkTextPrimary = Color(0xFFFFFFFF);
  static const darkTextSecondary = Color(0xFF869D98);

  // Light mode colors
  static const lightBackground = Color(0xFFF4F8F6);
  static const lightSurface = Color(0xFFFFFFFF);
  static const lightBorder = Color(0xFFD9E2DF);
  static const lightTextPrimary = Color(0xFF0D1715);
  static const lightTextSecondary = Color(0xFF5C7770);

  // Backgrounds / surfaces
  static const bgDark = darkBackground;
  static const bgLight = lightBackground;
  static const surfaceDark = darkSurface;
  static const surfaceLight = lightSurface;
  static const borderDark = darkBorder;
  static const borderLight = lightBorder;
  static const divider = darkBorder;

  // Text / muted colors
  static const textDark = darkTextPrimary;
  static const textLight = lightTextPrimary;
  static const textSecondary = darkTextSecondary;
  static const textMuted = lightTextSecondary;
  static const mutedDark = darkTextSecondary;
  static const mutedLight = lightTextSecondary;

  // Glass surfaces
  static const glassNav = Color(0xB8121212);
  static const glassDark = Color(0x80000000);
  static const glassLight = Color(0x0FFFFFFF);

  // Faculty badge colors
  static const simme = accent;
  static const sbms = cyan;
  static const facultyDefault = purple;
  static const googleWhite = Color(0xFFFFFFFF);
  static const googleBlue = Color(0xFF4285F4);

  static Color faculty(String? tag) {
    switch (tag) {
      case 'SIMME':
        return simme;
      case 'SBMS':
        return sbms;
      default:
        return facultyDefault;
    }
  }
}

typedef BlinkColors = AppColors;

/// Resolved token set for the current theme mode, so screens don't need
/// `isDark ? a : b` everywhere.
class BlinkPalette {
  final bool isDark;
  final Color background;
  final Color surface;
  final Color border;
  final Color text;
  final Color muted;

  const BlinkPalette({
    required this.isDark,
    required this.background,
    required this.surface,
    required this.border,
    required this.text,
    required this.muted,
  });

  factory BlinkPalette.of(bool isDark) {
    return BlinkPalette(
      isDark: isDark,
      background: isDark ? BlinkColors.bgDark : BlinkColors.bgLight,
      surface: isDark ? BlinkColors.surfaceDark : BlinkColors.surfaceLight,
      border: isDark ? BlinkColors.borderDark : BlinkColors.borderLight,
      text: isDark ? BlinkColors.textDark : BlinkColors.textLight,
      muted: isDark ? BlinkColors.mutedDark : BlinkColors.mutedLight,
    );
  }
}

/// Radial gradient used behind the whole app shell in the Figma file.
BoxDecoration blinkBackgroundDecoration(bool isDark) {
  return BoxDecoration(
    gradient: RadialGradient(
      center: const Alignment(0.2, -1.0),
      radius: 1.2,
      colors: isDark
          ? [const Color(0xFF1A0012), BlinkColors.bgDark]
          : [const Color(0xFFF0E8FF), BlinkColors.bgLight],
      stops: const [0.0, 0.55],
    ),
  );
}

const blinkFontFamily = 'Outfit';

ThemeData buildBlinkTheme({required bool isDark}) {
  final palette = BlinkPalette.of(isDark);
  
  // Replaced copyWith(fontFamily: ...) by passing it directly to ThemeData
  return ThemeData(
    brightness: isDark ? Brightness.dark : Brightness.light,
    fontFamily: blinkFontFamily,
    scaffoldBackgroundColor: palette.background,
    colorScheme: (isDark ? const ColorScheme.dark() : const ColorScheme.light()).copyWith(
      primary: BlinkColors.accent,
      surface: palette.surface,
    ),
  );
}

// Global theme instance for main.dart
final blinkTheme = buildBlinkTheme(isDark: true);