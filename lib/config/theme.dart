import 'package:flutter/material.dart';

/// Updated app palette based on the new brand colors.
class AppColors {
  AppColors._();

  // Brand accent (shared across both modes).
  // Was a bright mint/teal (#26D98F) — replaced with a true dark green
  // (Tailwind "green-600") that still has enough luminance contrast to
  // read clearly on both pure black and pure white backgrounds.
  static const primaryMint = Color(0xFF16A34A);
  static const accentGold = Color(0xFFFFCF10);
  static const accentRed = Color(0xFFFF2A3B);
  static const accentBlue = Color(0xFF1A83FA);
  // FIX: this used to be Color(0xFF0A0A0A) — the exact same hex as
  // `darkBackground` AND `lightTextPrimary`. Anywhere brandPink was used
  // as an accent/text color on the dark background it was invisible
  // (black on black). It's now aliased to the green accent instead, so
  // there's exactly one "special" brand color and it's always legible.
  static const brandPink = primaryMint;

  // Legacy aliases used across the app for compatibility
  static const primary = primaryMint;
  static const primaryDeep = primaryMint;
  static const accent = primaryMint;
  static const accentSoft = Color(0xFFBBF7D0); // light green tint, for hover/highlight states
  static const gold = accentGold;
  // FIX: purple and cyan both pointed at accentBlue, so anything using
  // `AppColors.purple` and anything using `AppColors.cyan` rendered as the
  // identical color (this is what was making SIMME/SBMS/default faculty
  // badges overlap). Keeping the app otherwise monochrome, these are now
  // two distinct neutral grays instead of introducing more competing hues.
  static const purple = Color(0xFF4B5563); // slate gray
  static const cyan = Color(0xFF9CA3AF); // light gray
  static const online = primaryMint;
  static const error = accentRed;

  // Dark mode colors
  // Pure black background; text is pure white (see darkTextPrimary below).
  static const darkBackground = Color(0xFF000000);
  static const darkSurface = Color(0xFF172320);
  static const darkBorder = Color(0xFF2C423D);
  static const darkTextPrimary = Color(0xFFFFFFFF);
  static const darkTextSecondary = Color(0xFF869D98);

  // Light mode colors
  // Pure white background; text is pure black (see lightTextPrimary below).
  // lightSurface stays pure white and lightBackground a hair off-white so
  // elevated cards are still distinguishable from the page background.
  static const lightBackground = Color(0xFFF4F8F6);
  static const lightSurface = Color(0xFFFFFFFF);
  static const lightBorder = Color(0xFFD9E2DF);
  static const lightTextPrimary = Color(0xFF000000);
  static const lightTextSecondary = Color(0xFF5C7770);

  // Backgrounds / surfaces
  static const bgDark = darkBackground;
  static const bgLight = lightBackground;
  static const surfaceDark = darkSurface;
  static const surfaceLight = lightSurface;
  static const borderDark = darkBorder;
  static const borderLight = lightBorder;
  // FIX: this was hard-coded to darkBorder regardless of mode, so light-mode
  // dividers were silently using dark-mode styling. Use a neutral
  // semi-transparent gray that reads correctly against both backgrounds.
  static const divider = Color(0x1F888888);

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

  // Faculty badge colors — simme is the one colored (green) badge,
  // sbms/default are neutral grays so they're always visually distinct
  // from each other and from simme.
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
          ? [const Color(0xFF0D1F16), BlinkColors.bgDark]
          : [const Color(0xFFE7F7EE), BlinkColors.bgLight],
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