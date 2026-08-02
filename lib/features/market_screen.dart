import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../post_model.dart';

class MarketScreen extends StatelessWidget {
  final bool isDark;
  final ValueChanged<String> onSnack;
  const MarketScreen({super.key, required this.isDark, required this.onSnack});

  @override
  Widget build(BuildContext context) {
    final txt = isDark ? BlinkColors.textDark : BlinkColors.textLight;
    final cardBg = isDark ? BlinkColors.surfaceDark : Colors.white;
    final border = isDark ? BlinkColors.borderDark : BlinkColors.borderLight;

    return CustomScrollView(
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
          sliver: SliverToBoxAdapter(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Market', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: txt)),
                ElevatedButton.icon(
                  onPressed: () => onSnack('Post a listing'),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Sell'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: BlinkColors.accent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(100)),
                    textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 0.72,
            ),
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                final item = marketItems[i];
                return Container(
                  decoration: BoxDecoration(
                    color: cardBg,
                    border: Border.all(color: border),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AspectRatio(
                        aspectRatio: 1,
                        child: Image.network(unsplash(item.img), fit: BoxFit.cover),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(10, 10, 10, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: BlinkColors.accent.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(100),
                              ),
                              child: Text(item.tag, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: BlinkColors.accent, letterSpacing: 0.5)),
                            ),
                            const SizedBox(height: 6),
                            Text(item.title, maxLines: 2, overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: txt, height: 1.3)),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(item.price, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: BlinkColors.accent)),
                                GestureDetector(
                                  onTap: () => onSnack('Added to cart'),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: BlinkColors.accent, borderRadius: BorderRadius.circular(100)),
                                    child: const Text('Buy', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
              childCount: marketItems.length,
            ),
          ),
        ),
      ],
    );
  }
}