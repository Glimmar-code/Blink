import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../post_model.dart';

class MyProfileScreen extends StatelessWidget {
  final bool isDark;
  final ValueChanged<String> onSnack;

  const MyProfileScreen({super.key, required this.isDark, required this.onSnack});

  @override
  Widget build(BuildContext context) {
    final txt = isDark ? BlinkColors.textDark : BlinkColors.textLight;
    final muted = isDark ? BlinkColors.mutedDark : BlinkColors.mutedLight;
    final bg = isDark ? BlinkColors.bgDark : BlinkColors.bgLight;

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
                          child: const ClipOval(
                            child: Image(
                              image: NetworkImage('https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=176&h=176&fit=crop'),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        OutlinedButton(
                          onPressed: () => onSnack('Edit profile'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: txt,
                            side: BorderSide(color: isDark ? BlinkColors.borderDark : BlinkColors.borderLight),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                          ),
                          child: const Text('Edit Profile', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('you', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: txt)),
                    const SizedBox(height: 8),
                    Text('Your bio goes here.', style: TextStyle(fontSize: 13, color: muted)),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _Stat(label: 'Posts', value: '${myGridImages.length}', txt: txt, muted: muted),
                        _Stat(label: 'Followers', value: '2.4K', txt: txt, muted: muted),
                        _Stat(label: 'Following', value: '312', txt: txt, muted: muted),
                      ],
                    ),
                    const SizedBox(height: 24),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: myGridImages.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 8,
                        crossAxisSpacing: 8,
                        childAspectRatio: 1,
                      ),
                      itemBuilder: (context, i) => ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(unsplash(myGridImages[i]), fit: BoxFit.cover),
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

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final Color txt;
  final Color muted;
  const _Stat({required this.label, required this.value, required this.txt, required this.muted});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: txt)),
        Text(label, style: TextStyle(fontSize: 11, color: muted)),
      ],
    );
  }
}