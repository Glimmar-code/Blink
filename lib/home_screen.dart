import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:phosphoricons_flutter/phosphoricons_flutter.dart';

// Absolute package imports prevent "cannot find path" errors
import 'package:blink/config/theme.dart';
import 'package:blink/features/feed_screen.dart';
import 'package:blink/features/search_screen.dart';
import 'package:blink/features/leaderboard_screen.dart';
import 'package:blink/features/market_screen.dart';
import 'package:blink/features/notifications_screen.dart';
import 'package:blink/features/messages_screen.dart';
import 'package:blink/features/profile/guest_profile_screen.dart';
import 'package:blink/widgets/blink_snackbar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  // Figma defaulted to dark mode. Flip this (or wire it to a settings
  // screen / DarkModeToggle widget) if you want light mode by default.
  bool _isDark = true;

  final _snack = BlinkSnackController();

  static const _items = <_NavItem>[
    _NavItem(icon: PhosphorIconsRegular.house, filledIcon: PhosphorIconsFill.house, label: 'Feed'),
    _NavItem(icon: PhosphorIconsRegular.magnifyingGlass, filledIcon: PhosphorIconsFill.magnifyingGlass, label: 'Search'),
    _NavItem(icon: PhosphorIconsRegular.trophy, filledIcon: PhosphorIconsFill.trophy, label: 'Ranks'),
    _NavItem(icon: PhosphorIconsRegular.storefront, filledIcon: PhosphorIconsFill.storefront, label: 'Market'),
    _NavItem(icon: PhosphorIconsRegular.bell, filledIcon: PhosphorIconsFill.bell, label: 'Alerts'),
    _NavItem(icon: PhosphorIconsRegular.chatCircle, filledIcon: PhosphorIconsFill.chatCircle, label: 'Chats'),
  ];

  void _showSnack(String msg) => _snack.show(msg);

  void _openProfile(String username) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => GuestProfileScreen(username: username, isDark: _isDark, onSnack: _showSnack),
      ),
    );
  }

  @override
  void dispose() {
    _snack.dispose();
    super.dispose();
  }

  List<Widget> get _screens => [
        FeedScreen(isDark: _isDark, onSnack: _showSnack, onProfile: _openProfile),
        SearchScreen(isDark: _isDark),
        LeaderboardScreen(isDark: _isDark),
        MarketScreen(isDark: _isDark, onSnack: _showSnack),
        NotificationsScreen(isDark: _isDark),
        MessagesScreen(isDark: _isDark, onSnack: _showSnack),
      ];

  @override
  Widget build(BuildContext context) {
    final screens = _screens;
    return Scaffold(
      body: Stack(
        children: [
          IndexedStack(
            index: _index,
            children: screens.map((s) => KeyedSubtree(key: ValueKey(s.runtimeType), child: s)).toList(),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 100,
            child: BlinkSnackbar(controller: _snack),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: _isDark ? const Color(0xFF09090D) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.18), blurRadius: 18, offset: const Offset(0, -10)),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_items.length, (i) {
                final item = _items[i];
                final selected = i == _index;
                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => setState(() => _index = i),
                    child: AnimatedContainer(
                      duration: 200.ms,
                      curve: Curves.easeOutCubic,
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: selected ? BlinkColors.accent : Colors.transparent,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Center(
                              child: PhosphorIcon(
                                selected ? item.filledIcon : item.icon,
                                size: 22,
                                color: selected ? Colors.white : (_isDark ? BlinkColors.mutedDark : BlinkColors.mutedLight),
                              ),
                            ),
                          ),
                          const SizedBox(height: 6),
                          if (selected)
                            Text(
                              item.label,
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: BlinkColors.accent),
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData filledIcon;
  final String label;
  const _NavItem({required this.icon, required this.filledIcon, required this.label});
}