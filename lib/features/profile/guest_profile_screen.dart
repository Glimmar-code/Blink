import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../post_model.dart';
import '../../widgets/faculty_badge.dart';
import '../../widgets/post_card.dart' show fmtNum;

class GuestProfileScreen extends StatefulWidget {
  final String username;
  final bool isDark;
  final ValueChanged<String> onSnack;

  const GuestProfileScreen({super.key, required this.username, required this.isDark, required this.onSnack});

  @override
  State<GuestProfileScreen> createState() => _GuestProfileScreenState();
}

class _GuestProfileScreenState extends State<GuestProfileScreen> {
  bool _following = false;

  @override
  Widget build(BuildContext context) {
    final isDark = widget.isDark;
    final user = leaderboard.firstWhere(
      (l) => l.user == widget.username,
      orElse: () => LeaderboardUser(
        rank: 0,
        user: widget.username,
        faculty: null,
        pts: 0,
        badge: '⭐',
        avatar: 'photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
      ),
    );
    final txt = isDark ? BlinkColors.textDark : BlinkColors.textLight;
    final muted = isDark ? BlinkColors.mutedDark : BlinkColors.mutedLight;
    final bg = isDark ? BlinkColors.bgDark : BlinkColors.bgLight;
    final images = myGridImages.take(4).toList();

    return Scaffold(
      backgroundColor: bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            backgroundColor: bg,
            pinned: false,
            expandedHeight: 140,
            leading: Padding(
              padding: const EdgeInsets.only(left: 8, top: 8),
              child: CircleAvatar(
                backgroundColor: Colors.black38,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 18),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
            ),
            flexibleSpace: const FlexibleSpaceBar(
              background: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF1A0033), Color(0xFF4A0080), Color(0xFFFF006E)],
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
            sliver: SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(0, -48),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: BlinkColors.accent, width: 3)),
                          padding: const EdgeInsets.all(2),
                          child: ClipOval(child: Image.network(unsplash(user.avatar), fit: BoxFit.cover)),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            setState(() => _following = !_following);
                            widget.onSnack(_following ? 'Following!' : 'Unfollowed');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _following ? Colors.transparent : BlinkColors.accent,
                            foregroundColor: _following ? muted : Colors.white,
                            side: BorderSide(color: _following ? const Color(0x40FFFFFF) : BlinkColors.accent, width: 1.5),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                            elevation: 0,
                          ),
                          child: Text(_following ? 'Following' : 'Follow', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(user.user, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: txt)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (user.faculty != null) ...[FacultyBadge(tag: user.faculty!), const SizedBox(width: 6)],
                        Text('${fmtNum(user.pts)} pts', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: BlinkColors.accent)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text('Creative director · Photographer · Building in public.', style: TextStyle(fontSize: 13, color: muted)),
                    const SizedBox(height: 24),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: images.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 8,
                        crossAxisSpacing: 8,
                        childAspectRatio: 1,
                      ),
                      itemBuilder: (context, i) => ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(unsplash(images[i]), fit: BoxFit.cover),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}