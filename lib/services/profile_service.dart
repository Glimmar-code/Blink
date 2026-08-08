import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:blink/features/profile/user_profile_model.dart';
import 'package:blink/services/auth_service.dart';

/// Lightweight profile service that reads/writes profile rows from
/// Supabase and maps them to the app's `UserProfile` model. This is
/// intentionally permissive on read: missing fields fall back to demo
/// values so the UI remains stable while you adapt your DB schema.
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

  /// Persist edits to the currently authenticated user's profile row.
  ///
  /// This was missing entirely before — `EditProfileScreen` only mutated
  /// the in-memory `UserProfile` object and popped it back to the caller,
  /// so nothing ever reached Supabase and edits vanished on next launch.
  ///
  /// Requires a `profiles` table keyed by `id` (the Supabase auth user id)
  /// with (at minimum) the columns referenced below. Add columns as your
  /// schema grows — anything not in this map is simply left untouched on
  /// the server. Returns true on success, false otherwise (check debug
  /// console for the underlying Postgrest error).
  static Future<bool> updateProfile(UserProfile profile) async {
    final user = AuthService.currentUser;
    if (user == null) {
      debugPrint('ProfileService.updateProfile: no authenticated user, aborting.');
      return false;
    }
    try {
      final row = <String, dynamic>{
        'id': user.id,
        'full_name': profile.fullName,
        'username': profile.username,
        'avatar_url': profile.avatar,
        'cover_photo': profile.coverPhoto,
        'pronouns': profile.pronouns,
        'university': profile.university,
        'faculty': profile.faculty,
        'department': profile.department,
        'course_of_study': profile.courseOfStudy,
        'academic_level': profile.academicLevel,
        'graduation_year': profile.graduationYear,
        'professional_headline': profile.professionalHeadline,
        'current_job_title': profile.currentJobTitle,
        'email': profile.email.value,
        'phone': profile.phone.value,
        'country_of_origin': profile.countryOfOrigin,
        'current_city_state': profile.currentCityState,
        'campus_hostel_location': profile.campusHostelLocation,
        'bio': profile.bio,
        'favorite_quote': profile.favoriteQuote,
        'custom_status': profile.customStatus,
        'website': profile.links.website,
        'linkedin': profile.links.linkedin,
        'twitter': profile.links.twitter,
        'instagram': profile.links.instagram,
        'featured_link': profile.links.featuredLink,
        'featured_link_label': profile.links.featuredLinkLabel,
        'follower_count': profile.followerCount,
        'following_count': profile.followingCount,
        'profile_views_this_week': profile.profileViewsThisWeek,
        'updated_at': DateTime.now().toUtc().toIso8601String(),
      };
      await _client.from('profiles').upsert(row);
      return true;
    } catch (e, st) {
      debugPrint('ProfileService.updateProfile error: $e');
      debugPrintStack(stackTrace: st);
      return false;
    }
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