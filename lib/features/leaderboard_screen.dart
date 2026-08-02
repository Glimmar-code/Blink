import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../post_model.dart';
import '../widgets/faculty_badge.dart';
import '../widgets/post_card.dart' show fmtNum;

class LeaderboardScreen extends StatelessWidget {
  final bool isDark;
  const LeaderboardScreen({super.key, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final txt = isDark ? BlinkColors.textDark : BlinkColors.textLight;
    final muted = isDark ? BlinkColors.mutedDark : BlinkColors.mutedLight;
    final cardBg = isDark ? BlinkColors.surfaceDark : Colors.white;
    final border = isDark ? BlinkColors.borderDark : BlinkColors.borderLight;

    final podiumOrder = [leaderboard[1], leaderboard[0], leaderboard[2]];

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Leaderboard', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: txt)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: BlinkColors.accent.withOpacity(0.12), borderRadius: BorderRadius.circular(100)),
              child: const Text('This Week', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: BlinkColors.accent)),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Podium
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: podiumOrder.map((u) {
            final isFirst = u.rank == 1;
            final avatarSize = isFirst ? 68.0 : 52.0;
            final barW = isFirst ? 70.0 : 56.0;
            final barH = isFirst ? 60.0 : 40.0;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 5),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(u.badge, style: const TextStyle(fontSize: 20)),
                  const SizedBox(height: 6),
                  Container(
                    width: avatarSize,
                    height: avatarSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: isFirst ? BlinkColors.gold : const Color(0x33FFFFFF), width: isFirst ? 3 : 2),
                    ),
                    padding: const EdgeInsets.all(2),
                    child: ClipOval(child: Image.network(unsplash(u.avatar), fit: BoxFit.cover)),
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: 60,
                    child: Text(u.user, textAlign: TextAlign.center, overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: txt)),
                  ),
                  Container(
                    width: barW,
                    height: barH,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isFirst ? BlinkColors.accent : (isDark ? const Color(0x14FFFFFF) : const Color(0xFFE5E7EB)),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                    ),
                    child: Text('#${u.rank}', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: isFirst ? Colors.white : muted)),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        // Full list
        ...leaderboard.map((u) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: cardBg,
                border: Border.all(color: border),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  SizedBox(
                    width: 24,
                    child: Text('#${u.rank}', textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: u.rank <= 3 ? BlinkColors.gold : muted)),
                  ),
                  const SizedBox(width: 12),
                  CircleAvatar(radius: 20, backgroundImage: NetworkImage(unsplash(u.avatar))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(u.user, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: txt)),
                        if (u.faculty != null) ...[const SizedBox(height: 3), FacultyBadge(tag: u.faculty!)],
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(fmtNum(u.pts), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: BlinkColors.accent)),
                      Text('pts', style: TextStyle(fontSize: 10, color: muted)),
                    ],
                  ),
                ],
              ),
            )),
      ],
    );
  }
}