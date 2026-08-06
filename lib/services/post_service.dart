import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:blink/post_model.dart';
import 'package:blink/features/profile/user_profile_model.dart';
import 'dart:io';

class PostService {
  static final _client = Supabase.instance.client;

  /// Fetch latest feed posts (very basic mapping). Expects a `posts`
  /// table with columns: id, type, username, avatar_url, faculty, created_at,
  /// text, gradient, image_url, caption, likes, comments, shares.
  static Future<List<FeedPost>> fetchFeed() async {
    try {
      final resp = await _client.from('posts').select().order('created_at', ascending: false).limit(50) as List<dynamic>;
      return resp.map((r) => _mapRow(r as Map<String, dynamic>)).toList();
    } catch (_) {
      return feedPosts; // fallback to demo data
    }
  }

  static FeedPost _mapRow(Map<String, dynamic> r) {
    final type = (r['type'] as String?) == 'photo' ? PostType.photo : PostType.text;
    return FeedPost(
      id: r['id'].toString(),
      type: type,
      user: (r['username'] as String?) ?? 'unknown',
      avatar: (r['avatar_url'] as String?) ?? feedPosts.first.avatar,
      faculty: (r['faculty'] as String?),
      time: _formatTime(r['created_at']),
      text: r['text'] as String?,
      gradient: (r['gradient'] as List<dynamic>?)?.map((e) => e as String).toList(),
      image: r['image_url'] as String?,
      caption: r['caption'] as String?,
      likes: (r['likes'] is int) ? r['likes'] as int : (r['likes'] is num ? (r['likes'] as num).toInt() : 0),
      comments: (r['comments'] is int) ? r['comments'] as int : 0,
      shares: (r['shares'] is int) ? r['shares'] as int : 0,
    );
  }

  static String _formatTime(dynamic createdAt) {
    // Keep it simple: show minutes/hours/days ago based on createdAt when available.
    try {
      final dt = DateTime.parse(createdAt as String);
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m';
      if (diff.inHours < 24) return '${diff.inHours}h';
      return '${diff.inDays}d';
    } catch (_) {
      return 'now';
    }
  }

  /// Create a new profile post (text or images). Returns the created
  /// `ProfilePost` mapped from the inserted row, or null on failure.
  static Future<ProfilePost?> createProfilePost({required String authorUsername, required String text, List<String>? images}) async {
    try {
      final row = {
        'username': authorUsername,
        'text': text,
        'images': images,
        'created_at': DateTime.now().toUtc().toIso8601String(),
      };
      final resp = await _client.from('profile_posts').insert(row).select().maybeSingle();
      if (resp == null) return null;
      final r = resp as Map<String, dynamic>;
      return _mapProfileRow(r);
    } catch (_) {
      return null;
    }
  }

  /// Upload a file to Supabase Storage and return a public URL, or null
  /// on failure. `bucket` should exist in your Supabase project.
  static Future<String?> uploadPostAsset(File file, {String bucket = 'posts'}) async {
    try {
      final ext = file.path.contains('.') ? file.path.split('.').last : 'jpg';
      final fileName = '${DateTime.now().toUtc().millisecondsSinceEpoch}.$ext';
      final pathInBucket = 'posts/$fileName';
      // upload the File object; FileOptions allows upsert
      await _client.storage.from(bucket).upload(pathInBucket, file, fileOptions: const FileOptions(upsert: true));
      final dynamic public = _client.storage.from(bucket).getPublicUrl(pathInBucket);
      // Normalize to a plain URL string. Different SDK versions return either a
      // string or a map-like object; coerce to a sensible string safely.
      if (public == null) return null;
      if (public is String) return public;
      if (public is Map && public.containsKey('publicUrl')) return public['publicUrl']?.toString();
      // Fallback to a best-effort string representation.
      return public.toString();
    } catch (_) {
      return null;
    }
  }

  static Future<ProfilePost?> updateProfilePost({required String postId, String? text, List<String>? images}) async {
    try {
      final updates = <String, dynamic>{};
      if (text != null) updates['text'] = text;
      if (images != null) updates['images'] = images;
      final resp = await _client.from('profile_posts').update(updates).eq('id', postId).select().maybeSingle();
      if (resp == null) return null;
      return _mapProfileRow(resp as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  static Future<bool> deleteProfilePost(String postId) async {
    try {
      await _client.from('profile_posts').delete().eq('id', postId);
      return true;
    } catch (_) {
      return false;
    }
  }

  static ProfilePost _mapProfileRow(Map<String, dynamic> r) {
    return ProfilePost(
      id: r['id'].toString(),
      kind: (r['kind'] as String?) == 'image' ? ProfilePostKind.image : ProfilePostKind.text,
      text: r['text'] as String? ?? '',
      images: (r['images'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      createdAt: DateTime.tryParse(r['created_at'] as String? ?? '') ?? DateTime.now(),
      likeCount: (r['like_count'] is int) ? r['like_count'] as int : 0,
      commentCount: (r['comment_count'] is int) ? r['comment_count'] as int : 0,
      repostCount: (r['repost_count'] is int) ? r['repost_count'] as int : 0,
      viewCount: (r['view_count'] is int) ? r['view_count'] as int : 0,
      authorUsername: (r['username'] as String?) ?? '',
      authorFullName: (r['author_full_name'] as String?) ?? '',
      authorAvatar: (r['author_avatar'] as String?) ?? '',
    );
  }
}
