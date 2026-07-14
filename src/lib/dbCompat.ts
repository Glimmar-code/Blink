import type { AuthProfile } from '../types/auth';
import type { Post } from '../components/PostCard';

export const PROFILE_SELECT = `
  id,
  handle,
  name,
  full_name,
  avatar_url,
  cover_url,
  bio,
  university,
  faculty,
  department,
  level,
  gender,
  relationship_status,
  phone,
  hobby,
  xp,
  current_wallet_balance,
  followers_count,
  following_count,
  created_at
`.trim();

export const POST_WITH_PROFILE_SELECT = `
  id,
  author_id,
  content,
  image_url,
  likes_count,
  comments_count,
  shares_count,
  tag,
  created_at,
  profiles:author_id (
    id,
    handle,
    name,
    full_name,
    avatar_url,
    university
  )
`.trim();

export const COMMENT_WITH_PROFILE_SELECT = `
  id,
  post_id,
  author_id,
  content,
  created_at,
  profiles:author_id (
    id,
    handle,
    name,
    full_name,
    avatar_url
  )
`.trim();

export function mapProfile(row: any): AuthProfile {
  return {
    id: row.id,
    username: row.handle ?? row.username ?? '',
    full_name: row.full_name ?? row.name ?? '',
    avatar_url: row.avatar_url ?? null,
    cover_url: row.cover_url ?? null,
    bio: row.bio ?? null,
    university: row.university ?? null,
    faculty: row.faculty ?? null,
    department: row.department ?? null,
    level: row.level ?? null,
    gender: row.gender ?? null,
    relationship_status: row.relationship_status ?? null,
    phone: row.phone ?? null,
    hobby: row.hobby ?? null,
    xp: row.xp ?? 0,
    current_wallet_balance: row.current_wallet_balance ?? 0,
    followers_count: row.followers_count ?? 0,
    following_count: row.following_count ?? 0,
    created_at: row.created_at,
  };
}

export function mapPost(row: any): Post {
  const profile = row.profiles ?? {};
  return {
    id: row.id,
    user_id: row.author_id ?? row.user_id,
    username: profile.handle ?? profile.username ?? '',
    full_name: profile.full_name ?? profile.name ?? '',
    avatar_url: profile.avatar_url ?? null,
    content: row.content ?? '',
    image_url: row.image_url ?? null,
    likes_count: row.likes_count ?? 0,
    comments_count: row.comments_count ?? 0,
    shares_count: row.shares_count ?? 0,
    liked: row.liked ?? false,
    saved: row.saved ?? false,
    created_at: row.created_at,
    tag: row.tag ?? null,
    university: profile.university ?? null,
  };
}

export function defaultHandleFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase();
  return base + Math.floor(Math.random() * 1000);
}

export function profileToDbPayload(profile: Partial<AuthProfile> & { id: string }) {
  return {
    id: profile.id,
    handle: profile.username,
    name: profile.full_name,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    cover_url: profile.cover_url,
    bio: profile.bio,
    university: profile.university,
    faculty: profile.faculty,
    department: profile.department,
    level: profile.level,
    gender: profile.gender,
    relationship_status: profile.relationship_status,
    phone: profile.phone,
    hobby: profile.hobby,
  };
}
