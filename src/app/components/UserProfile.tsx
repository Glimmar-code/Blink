import { View, Text } from "react-native";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, UserPlus, UserCheck, Users, PlaySquare, MapPin, X, ChevronLeft, Coins, ShoppingBag, BookMarked, Heart, Grid3X3 } from "lucide-react";
import { Link } from "react-router"; // Added React Router Link
import { PostCard } from "./HomeScreen";

/** Animates a number from 0 up to `value` once `start` flips true. */
function useCountUp(value: number, start: boolean, duration = 1100) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;
    let frame: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, value, duration]);

  return display;
}

/** Compact number formatting, e.g. 4500 -> "4.5k". */
function formatCompact(n: number): string {
  if (n >= 1000) {
    const rounded = n % 1000 === 0 ? `${n / 1000}` : (n / 1000).toFixed(1);
    return `${rounded}k`;
  }
  return `${n}`;
}

// Placeholder user lists
const FOLLOWERS_LIST = [
  { id: 1, name: "Aisha Bello", handle: "@aisha_b", avatar: "https://i.pravatar.cc/48?img=1" },
  { id: 2, name: "Chidi Okonkwo", handle: "@chidi_ok", avatar: "https://i.pravatar.cc/48?img=3" },
  { id: 3, name: "Fatima Yusuf", handle: "@fatimay", avatar: "https://i.pravatar.cc/48?img=5" },
  { id: 4, name: "Emeka Nwosu", handle: "@emeka_n", avatar: "https://i.pravatar.cc/48?img=7" },
  { id: 5, name: "Ngozi Eze", handle: "@ngozi_e", avatar: "https://i.pravatar.cc/48?img=9" },
  { id: 6, name: "Tunde Adeyemi", handle: "@tunde_a", avatar: "https://i.pravatar.cc/48?img=11" },
  { id: 8, name: "Kelechi Ibe", handle: "@kelechi_i", avatar: "https://i.pravatar.cc/48?img=15" },
];

const FOLLOWING_LIST = [
  { id: 1, name: "Ada Okafor", handle: "@ada_ok", avatar: "https://i.pravatar.cc/48?img=20" },
  { id: 2, name: "Seun Adeleke", handle: "@seun_a", avatar: "https://i.pravatar.cc/48?img=22" },
  { id: 3, name: "Chisom Nze", handle: "@chisom_n", avatar: "https://i.pravatar.cc/48?img=24" },
  { id: 4, name: "Biodun Lawal", handle: "@biodun_l", avatar: "https://i.pravatar.cc/48?img=26" },
  { id: 5, name: "Yemi Coker", handle: "@yemi_c", avatar: "https://i.pravatar.cc/48?img=28" },
];

type TabType = "posts" | "liked" | "saved";

interface UserListModalProps {
  title: string;
  users: { id: number; name: string; handle: string; avatar: string }[];
  onClose: () => void;
}

function UserListModal({ title, users, onClose }: UserListModalProps) {
  return (
    <View
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <View
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col animate-rise"
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
      >
        <View className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </View>
        <View className="overflow-y-auto flex-1 px-5 py-3 flex flex-col gap-4">
          {users.map((user) => (
            <View key={user.id} className="flex items-center gap-3">
              {/* Linked Avatar */}
              <Link 
                to={`/profile/${user.handle.replace('@', '')}`} 
                onClick={onClose}
                className="shrink-0"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-gray-100 hover:opacity-80 transition-opacity"
                />
              </Link>
              <View className="flex-1 min-w-0">
                {/* Linked Name */}
                <Link 
                  to={`/profile/${user.handle.replace('@', '')}`}
                  onClick={onClose}
                  className="hover:underline"
                >
                  <Text className="font-semibold text-gray-900 text-sm truncate">{user.name}</Text>
                </Link>
                <Text className="text-gray-400 text-xs">{user.handle}</Text>
              </View>
              <Link
                to={`/profile/${user.handle.replace('@', '')}`}
                onClick={onClose}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition-colors shrink-0"
              >
                View
              </Link>
            </View>
          ))}
        </View>
        <View className="h-5" />
      </View>
    </View>
  );
}

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  return (
    <View
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-pop"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
        onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}
      />
    </View>
  );
}

// Ensure this matches the IUser interface from your MessagesScreen
interface IUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: "blue" | "yellow" | null;
  online: boolean;
  lastSeen: string;
  bio: string;
  followers: number;
  following: number;
}

interface UserProfileProps {
  user: IUser;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onBack: () => void;
  onMessage: () => void;
}

export function UserProfile({ user, isFollowing, onToggleFollow, onBack, onMessage }: UserProfileProps) {
  const [mounted, setMounted] = useState(false);
  const [feedVisible, setFeedVisible] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Lightbox state
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>("");

  // User list modal state
  const [userListModal, setUserListModal] = useState<null | "followers" | "following">(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  // Connect state (local toggle)
  const [isConnected, setIsConnected] = useState(false);

  const coverPhoto =
    "https://images.unsplash.com/photo-1562774053-701939374585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const node = feedRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeedVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const streak = useCountUp(45, mounted);
  const campusRank = useCountUp(42, mounted);
  const worldRank = useCountUp(1200, mounted);
  const posts = useCountUp(128, mounted);
  const followers = useCountUp(user.followers, mounted);
  const following = useCountUp(user.following, mounted);
  const likes = useCountUp(45000, mounted);

  return (
    <View className="flex flex-col h-full bg-white relative">
      {/* Scoped keyframes */}
      <style>{`
        @keyframes coverDrift {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.06) translateY(-1%); }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.08) rotate(-3deg); }
          75% { transform: scale(1.04) rotate(3deg); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(-130%) skewX(-15deg); opacity: 0; }
          8% { opacity: 1; }
          35% { transform: translateX(230%) skewX(-15deg); opacity: 1; }
          45%, 100% { transform: translateX(230%) skewX(-15deg); opacity: 0; }
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-rise { animation: riseIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-pop { animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .cover-drift { animation: coverDrift 16s ease-in-out infinite; }
        .flame-flicker { animation: flameFlicker 1.8s ease-in-out infinite; display: inline-block; }
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after {
          content: "";
          position: absolute;
          top: 0; left: 0; height: 100%; width: 38%;
          background: linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent);
          animation: shimmerSweep 4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-rise, .animate-pop, .cover-drift, .flame-flicker, .shimmer::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* Lightbox */}
      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={lightboxAlt}
          onClose={() => setLightboxSrc(null)}
        />
      )}

      {/* Followers / Following modal */}
      {userListModal === "followers" && (
        <UserListModal
          title="Followers"
          users={FOLLOWERS_LIST}
          onClose={() => setUserListModal(null)}
        />
      )}
      {userListModal === "following" && (
        <UserListModal
          title="Following"
          users={FOLLOWING_LIST}
          onClose={() => setUserListModal(null)}
        />
      )}

      {/* Top Nav Bar */}
      <View className="flex items-center px-4 py-3 bg-white border-b border-gray-100 z-10 shrink-0">
        <button
          type="button"
          aria-label="Go back"
          onClick={onBack}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="flex-1 text-center font-bold text-gray-900 text-base">{user.name}</h2>
        <View className="w-9 h-9" />
      </View>

      <View className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Cover Photo */}
        <View className="relative h-44 bg-gray-200 overflow-visible">
          <button
            type="button"
            aria-label="View cover photo"
            className="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => { setLightboxSrc(coverPhoto); setLightboxAlt("Cover photo"); }}
          >
            <img
              src={coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover cover-drift"
            />
          </button>
          <View className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent pointer-events-none" />

          {/* Avatar overlapping */}
          <View className="absolute -bottom-12 left-5">
            <View className="relative animate-pop" style={{ animationDelay: "80ms" }}>
              <button
                type="button"
                aria-label="View avatar"
                className="w-28 h-28 aspect-square rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 block shrink-0 overflow-hidden"
                onClick={() => { setLightboxSrc(user.avatar); setLightboxAlt(user.name); }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-28 h-28 aspect-square rounded-full border-4 border-white object-cover shadow-md hover:opacity-90 transition-opacity block shrink-0"
                />
              </button>
              {user.online && (
                <Text className="absolute bottom-1.5 right-1.5 flex w-5 h-5 pointer-events-none">
                  <Text className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <Text className="relative inline-flex w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* User Info */}
        <View className="px-5 mt-16 mb-6">
          <View className="flex justify-between items-start gap-3">
            <View className="animate-rise flex-1 min-w-0" style={{ animationDelay: "120ms" }}>
              <View className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h1>
                {user.verified && (
                  <svg
                    className={`w-5 h-5 shrink-0 ${user.verified === "blue" ? "text-blue-500" : "text-amber-500"}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-label="Verified account"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </View>
              <Text className="text-gray-500 font-medium">@{user.username}</Text>

              <View className="flex items-center gap-2 mt-2 text-sm flex-wrap">
                {user.online ? (
                  <Text className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <Text className="relative flex w-2.5 h-2.5">
                      <Text className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                      <Text className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
                    </Text>
                    Active now
                  </Text>
                ) : (
                  <Text className="text-gray-400 text-sm">Last seen {user.lastSeen}</Text>
                )}
              </View>

              {user.bio && (
                <Text className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm">
                  {user.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons: Follow / Connect / Message */}
          <View className="mt-5 flex gap-2.5 animate-rise" style={{ animationDelay: "160ms" }}>
            <button
              type="button"
              onClick={onToggleFollow}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isFollowing
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:outline-gray-400"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus-visible:outline-blue-400"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsConnected((v) => !v)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 focus-visible:outline-emerald-400"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus-visible:outline-gray-400"
              }`}
            >
              <Users className="w-4 h-4" />
              {isConnected ? "Connected" : "Connect"}
            </button>

            <button
              type="button"
              onClick={onMessage}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
          </View>

          {/* Stats Row */}
          <View className="flex gap-3 mt-6">
            <View
              className="flex-1 bg-orange-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-orange-100 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: "200ms" }}
            >
              <Text className="text-xl font-bold text-orange-600 tabular-nums">
                <Text className="flame-flicker mr-1">🔥</Text>
                {streak}
              </Text>
              <Text className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mt-1">
                Daily Streak
              </Text>
            </View>
            <View
              className="flex-1 bg-blue-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-blue-100 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: "260ms" }}
            >
              <Text className="text-xl font-bold text-blue-600 tabular-nums">#{campusRank}</Text>
              <Text className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1">
                Campus Rank
              </Text>
            </View>
            <View
              className="flex-1 bg-purple-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-purple-100 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: "320ms" }}
            >
              <Text className="text-xl font-bold text-purple-600 tabular-nums">
                {formatCompact(worldRank)}
              </Text>
              <Text className="text-[10px] font-bold text-purple-800 uppercase tracking-wider mt-1">
                World Rank
              </Text>
            </View>
          </View>

          {/* Engagement Stats */}
          <View className="flex justify-between mt-6 px-2">
            <View className="flex flex-col items-center animate-rise" style={{ animationDelay: "360ms" }}>
              <Text className="text-xl font-bold text-gray-900 tabular-nums">{posts}</Text>
              <Text className="text-xs text-gray-500 font-medium">Posts</Text>
            </View>
            <button
              type="button"
              onClick={() => setUserListModal("followers")}
              className="flex flex-col items-center animate-rise hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 rounded-lg px-2 py-1"
              style={{ animationDelay: "400ms" }}
            >
              <Text className="text-xl font-bold text-gray-900 tabular-nums">{formatCompact(followers)}</Text>
              <Text className="text-xs text-gray-500 font-medium">Followers</Text>
            </button>
            <button
              type="button"
              onClick={() => setUserListModal("following")}
              className="flex flex-col items-center animate-rise hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 rounded-lg px-2 py-1"
              style={{ animationDelay: "440ms" }}
            >
              <Text className="text-xl font-bold text-gray-900 tabular-nums">{following}</Text>
              <Text className="text-xs text-gray-500 font-medium">Following</Text>
            </button>
            <View className="flex flex-col items-center animate-rise" style={{ animationDelay: "480ms" }}>
              <Text className="text-xl font-bold text-gray-900 tabular-nums">{formatCompact(likes)}</Text>
              <Text className="text-xs text-gray-500 font-medium">Likes</Text>
            </View>
          </View>
        </View>

        {/* Content Tabs */}
        <View ref={feedRef} className="bg-gray-50 flex flex-col border-t border-gray-100">
          {/* Tab Navigation */}
          <View className="flex bg-white border-b border-gray-100 sticky top-0 z-10">
            {(
              [
                { key: "posts", label: "Posts", Icon: Grid3X3 },
                { key: "liked", label: "Liked", Icon: Heart },
                { key: "saved", label: "Saved", Icon: BookMarked },
              ] as { key: TabType; label: string; Icon: React.ElementType }[]
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors duration-200 border-b-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 ${
                  activeTab === key
                    ? "border-yellow-500 text-yellow-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </View>

          {/* Tab Content */}
          <View className="flex flex-col gap-2 pt-2">
            {activeTab === "posts" && (
              <>
                <View
                  className={`transition-all duration-500 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </View>
                <View
                  className={`transition-all duration-500 delay-150 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </View>
              </>
            )}

            {activeTab === "liked" && (
              <>
                <View
                  className={`transition-all duration-500 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </View>
                <View
                  className={`transition-all duration-500 delay-150 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </View>
              </>
            )}

            {activeTab === "saved" && (
              <>
                <View
                  className={`transition-all duration-500 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </View>
                <View
                  className={`transition-all duration-500 delay-150 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
