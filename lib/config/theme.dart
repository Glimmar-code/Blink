import 'package:flutter/material.dart';

/// Colors pulled directly from the Figma export.
/// NOTE: this app is dark-mode-first (Figma defaulted isDark = true).
/// Where the Figma file swapped a color based on light/dark mode, use the
/// `light`/`dark` pairs below via `BlinkColors.of(context)` or pass isDark
/// explicitly — see `BlinkTheme.colors(isDark)`.
class BlinkColors {
  BlinkColors._();

  // Brand
  static const primary = Color(0xFFFF3B8B);
  static const primaryDeep = Color(0xFFD81B60);
  static const accent = Color(0xFFFF3B8B); // #FF3B8B
  static const accentSoft = Color(0xFFFF8EBA);
  static const gold = Color(0xFFFFD700); // #1 rank / stars
  static const purple = Color(0xFFA78BFA); // saved / SIMME-adjacent
  static const cyan = Color(0xFF22D3EE); // SBMS faculty badge
  static const online = Color(0xFF22C55E); // online-status dot
  static const error = Color(0xFFEF4444); // Form errors

  // Backgrounds (mode-dependent)
  static const bgDark = Color(0xFF000000);
  static const bgLight = Color(0xFFF5F5F7);

  // Surfaces / cards
  static const surfaceDark = Color(0x0AFFFFFF); // rgba(255,255,255,0.04)
  static const surfaceLight = Color(0xFFFFFFFF);

  // Borders / dividers
  static const borderDark = Color(0x12FFFFFF); // rgba(255,255,255,0.07)
  static const borderLight = Color(0x14000000); // rgba(0,0,0,0.08)
  static const divider = Color(0x12FFFFFF); 

  // Text
  static const textDark = Color(0xFFFFFFFF);
  static const textLight = Color(0xFF0A0A0A);
  static const textSecondary = Color(0xFFA1A1AA); 
  static const textMuted = Color(0xFF71717A); 
  static const mutedDark = Color(0x73FFFFFF); // rgba(255,255,255,0.45)
  static const mutedLight = Color(0x66000000); // rgba(0,0,0,0.4)

  // Glass surfaces (nav bar, sheets, menus)
  static const glassNav = Color(0xB8121212); // rgba(18,18,18,0.72)
  static const glassDark = Color(0x80000000); // rgba(0,0,0,0.5)
  static const glassLight = Color(0x0FFFFFFF); // rgba(255,255,255,0.06)

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