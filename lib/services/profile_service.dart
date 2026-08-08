import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:blink/features/profile/user_profile_model.dart';
import 'package:blink/services/auth_service.dart';

/// Lightweight profile service that reads profile rows from Supabase and
/// maps them to the app's `UserProfile` model. This is intentionally
/// permissive: missing fields fall back to demo values so the UI remains
/// stable while you adapt your DB schema.
class ProfileService {
  static final _client = Supabase.instance.client;

  /// Fetch profile by username. Returns a demo profile when none found.
  static Future<UserProfile> fetchByUsername(String username) async {
    try {
      final resp = await _client
          .from('profiles')
          .select()
          .eq('username', username)
          .maybeSingle() as Map<String, dynamic>?;
      if (resp == null) return kDemoMyProfile.clone();
      return _mapRowToProfile(resp);
    } catch (_) {
      return kDemoMyProfile.clone();
    }
  }

  /// Fetch profile for the currently authenticated user.
  static Future<UserProfile> fetchCurrent() async {
    final user = AuthService.currentUser;
    if (user == null) return kDemoMyProfile.clone();

    // Prefer profile rows keyed by `id` (auth user id), otherwise try
    // to match on username stored in user metadata or email prefix.
    try {
      final byId = await _client.from('profiles').select().eq('id', user.id).maybeSingle() as Map<String, dynamic>?;
      if (byId != null) return _mapRowToProfile(byId);

      final metadata = user.userMetadata ?? <String, dynamic>{};
      final username = (metadata['username'] as String?) ?? (user.email?.split('@').first);
      if (username != null) {
        final byName = await _client.from('profiles').select().eq('username', username).maybeSingle() as Map<String, dynamic>?;
        if (byName != null) return _mapRowToProfile(byName);
      }
    } catch (_) {
      // fallthrough to demo
    }
    return kDemoMyProfile.clone();
  }

  static UserProfile _mapRowToProfile(Map<String, dynamic> row) {
    // Map common fields; adapt to your table column names.
    final fullName = (row['full_name'] as String?) ?? (row['name'] as String?) ?? kDemoMyProfile.fullName;
    final username = (row['username'] as String?) ?? kDemoMyProfile.username;
    final avatar = (row['avatar_url'] as String?) ?? (row['picture'] as String?) ?? kDemoMyProfile.avatar;
    final cover = (row['cover_photo'] as String?) ?? kDemoMyProfile.coverPhoto;
    final bio = (row['bio'] as String?) ?? kDemoMyProfile.bio;
    final followerCount = (row['follower_count'] is int) ? row['follower_count'] as int : (row['follower_count'] is num ? (row['follower_count'] as num).toInt() : kDemoMyProfile.followerCount);
    final followingCount = (row['following_count'] is int) ? row['following_count'] as int : (row['following_count'] is num ? (row['following_count'] as num).toInt() : kDemoMyProfile.followingCount);
    final views = (row['profile_views_this_week'] is int) ? row['profile_views_this_week'] as int : kDemoMyProfile.profileViewsThisWeek;

    final profile = kDemoMyProfile.clone()
      ..fullName = fullName
      ..username = username
      ..avatar = avatar
      ..coverPhoto = cover
      ..bio = bio
      ..followerCount = followerCount
      ..followingCount = followingCount
      ..profileViewsThisWeek = views;
    // Additional mapping (links, skills, badges) can be added when schema known.
    return profile;
  }
}
