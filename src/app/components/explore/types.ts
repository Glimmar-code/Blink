export type Badge = "none" | "white" | "blue";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  university: string;
  level: string;
  relationshipStatus: string;
  gender: string;
  avatar: string;
  badge: Badge;
  isActive: boolean;
  followers: number;
  bio: string;
}

export interface Post {
  id: string;
  user: UserProfile;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  reposts: number;
  time: string;
  image?: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
}
