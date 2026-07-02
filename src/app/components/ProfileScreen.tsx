import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Edit2, PlaySquare, MapPin, X, ChevronLeft, Coins, ShoppingBag, BookMarked, Heart, Grid3X3 } from "lucide-react";
import { BottomNav } from "./BottomNav";
import { PostCard } from "./HomeScreen";
// 1. Imported the separate EditProfileModal component
import { EditProfileModal } from "./EditProfileModal";
import { useAuth } from "../context/AuthContext";

/** Animates a number from 0 up to `value` once `start` flips true. */
function useCountUp(value: number, start: boolean, duration = 1100) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return;
    let frame: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-3 flex flex-col gap-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-gray-400 text-xs">{user.handle}</p>
              </div>
              <button
                type="button"
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition-colors shrink-0"
              >
                View
              </button>
            </div>
          ))}
        </div>
        <div className="h-5" />
      </div>
    </div>
  );
}

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  return (
    <div
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
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function ProfileScreen() {
  const navigate = useNavigate();
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

  // Fully connected responsive profile token infrastructure states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { profile, updateProfile } = useAuth();

  const [profileName, setProfileName] = useState(profile?.full_name ?? "Marcus Johnson");
  const [profileLocation, setProfileLocation] = useState(profile?.relationship ?? "Lagos, Nigeria");
  const [profileUsername, setProfileUsername] = useState(profile?.username ?? "marcus_j");
  const [profileBio, setProfileBio] = useState(profile?.bio ?? "Computer Science undergraduate passionate about tech, creative designs, and soccer.");
  const [profileUniversity, setProfileUniversity] = useState(profile?.university ?? "University of Lagos (UNILAG)");
  const [profileDepartment, setProfileDepartment] = useState(profile?.department ?? "Computer Science");
  const [profileLevel, setProfileLevel] = useState(profile?.level ?? "400L");
  const [profileGender, setProfileGender] = useState(profile?.gender ?? "Male");
  const [profileRelationship, setProfileRelationship] = useState(profile?.relationship ?? "Focusing on My Books");
  const [profilePhone, setProfilePhone] = useState(profile?.phone ?? "");
  const [profileHobbies, setProfileHobbies] = useState(profile?.hobbies ?? "Coding, Football, Gaming");

  const [profileCover, setProfileCover] = useState(
    "https://images.unsplash.com/photo-1562774053-701939374585?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYmFja2dyb3VuZHxlbnwxfHx8fDE3ODI0NzIwOTl8MA&ixlib=rb-4.1.0&q=80&w=800"
  );
  const [profileAvatar, setProfileAvatar] = useState(profile?.avatar_url ?? "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbGxlZ2UlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDcyMDk0fDA&ixlib=rb-4.1.0&q=80&w=400");

  useEffect(() => {
    if (!profile) return;
    setProfileName(profile.full_name || "Marcus Johnson");
    setProfileLocation(profile.relationship || "Lagos, Nigeria");
    setProfileUsername(profile.username || "marcus_j");
    setProfileBio(profile.bio || "Computer Science undergraduate passionate about tech, creative designs, and soccer.");
    setProfileUniversity(profile.university || "University of Lagos (UNILAG)");
    setProfileDepartment(profile.department || "Computer Science");
    setProfileLevel(profile.level || "400L");
    setProfileGender(profile.gender || "Male");
    setProfileRelationship(profile.relationship || "Focusing on My Books");
    setProfilePhone(profile.phone || "");
    setProfileHobbies(profile.hobbies || "Coding, Football, Gaming");
    setProfileAvatar(profile.avatar_url || "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbGxlZ2UlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDcyMDk0fDA&ixlib=rb-4.1.0&q=80&w=400");
    setProfileCover(profile.cover_url || profileCover);
  }, [profile]);

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
  const followers = useCountUp(4500, mounted);
  const following = useCountUp(324, mounted);
  const likes = useCountUp(45000, mounted);

  return (
    <div className="flex flex-col h-full bg-white relative">
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
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100 z-10 shrink-0">
        <button
          type="button"
          aria-label="Go back to Home"
          onClick={() => navigate("/home")} // Changed from "/" to "/home" to explicitly route to the home dashboard
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="flex-1 text-center font-bold text-gray-900 text-base">Profile</h2>
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Cover Photo */}
        <div className="relative h-44 bg-gray-200 overflow-hidden">
          <button
            type="button"
            aria-label="View cover photo"
            className="absolute inset-0 w-full h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => { setLightboxSrc(profileCover); setLightboxAlt("Cover photo"); }}
          >
            <img
              src={profileCover}
              alt="Cover"
              className="w-full h-full object-cover cover-drift"
            />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent pointer-events-none" />

          {/* Avatar overlapping */}
          <div className="absolute -bottom-12 left-5">
            <div className="relative animate-pop" style={{ animationDelay: "80ms" }}>
              <button
                type="button"
                aria-label="View avatar"
                className="w-28 h-28 aspect-square rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 block shrink-0 overflow-hidden"
                onClick={() => { setLightboxSrc(profileAvatar); setLightboxAlt(profileName); }}
              >
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className=" w-28 h-28 aspect-square rounded-full border-4 border-white object-cover shadow-md hover:opacity-90 transition-opacity block shrink-0"
                /> 
              </button>
              <span className="absolute bottom-1.5 right-1.5 flex w-5 h-5 pointer-events-none">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
              </span>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-5 mt-16 mb-6">
          <div className="flex justify-between items-start gap-3">
            <div className="animate-rise flex-1 min-w-0" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profileName}</h1>
                <svg
                  className="w-5 h-5 text-blue-500 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-label="Verified account"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">@{profileUsername}</p>

              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{profileLocation}</span>
              </div>

              <div className="flex items-center gap-2 mt-2 text-sm flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                  <span className="relative flex w-2.5 h-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
                  </span>
                  Active now
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400">Last seen 2m ago</span>
              </div>

              {/* Dynamic Professional Bio Area Extension */}
              {profileBio && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm">
                  {profileBio}
                </p>
              )}

              {/* Dynamic Styled Campus Credentials Badge Container */}
              {(profileUniversity || profileDepartment || profileLevel || profileHobbies || profileRelationship) && (
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {profileUniversity && (
                    <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full border border-yellow-100 flex items-center gap-1">
                      🎓 {profileUniversity.split(" (")[0]}
                    </span>
                  )}
                  {profileDepartment && (
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                      📚 {profileDepartment}
                    </span>
                  )}
                  {profileLevel && (
                    <span className="bg-purple-50 text-purple-700 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1">
                      ⚡ {profileLevel}
                    </span>
                  )}
                  {profileRelationship && (
                    <span className="bg-pink-50 text-pink-700 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full border border-pink-100 flex items-center gap-1">
                      ❤️ {profileRelationship}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Edit profile"
              onClick={() => setIsEditOpen(true)}
              className="p-2.5 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 hover:rotate-12 active:scale-90 transition-all duration-200 animate-pop focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 shrink-0"
              style={{ animationDelay: "160ms" }}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex gap-3 mt-6">
            <div
              className="flex-1 bg-orange-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-orange-100 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: "200ms" }}
            >
              <span className="text-xl font-bold text-orange-600 tabular-nums">
                <span className="flame-flicker mr-1">🔥</span>
                {streak}
              </span>
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mt-1">
                Daily Streak
              </span>
            </div>
            <div
              className="flex-1 bg-blue-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-blue-100 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: "260ms" }}
            >
              <span className="text-xl font-bold text-blue-600 tabular-nums">#{campusRank}</span>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mt-1">
                Campus Rank
              </span>
            </div>
            <div
              className="flex-1 bg-purple-50 rounded-2xl p-3 flex flex-col items-center justify-center border border-purple-100 animate-rise hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: "320ms" }}
            >
              <span className="text-xl font-bold text-purple-600 tabular-nums">
                {formatCompact(worldRank)}
              </span>
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider mt-1">
                World Rank
              </span>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex justify-between mt-6 px-2">
            <div className="flex flex-col items-center animate-rise" style={{ animationDelay: "360ms" }}>
              <span className="text-xl font-bold text-gray-900 tabular-nums">{posts}</span>
              <span className="text-xs text-gray-500 font-medium">Posts</span>
            </div>
            <button
              type="button"
              onClick={() => setUserListModal("followers")}
              className="flex flex-col items-center animate-rise hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 rounded-lg px-2 py-1"
              style={{ animationDelay: "400ms" }}
            >
              <span className="text-xl font-bold text-gray-900 tabular-nums">{formatCompact(followers)}</span>
              <span className="text-xs text-gray-500 font-medium">Followers</span>
            </button>
            <button
              type="button"
              onClick={() => setUserListModal("following")}
              className="flex flex-col items-center animate-rise hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 rounded-lg px-2 py-1"
              style={{ animationDelay: "440ms" }}
            >
              <span className="text-xl font-bold text-gray-900 tabular-nums">{following}</span>
              <span className="text-xs text-gray-500 font-medium">Following</span>
            </button>
            <div className="flex flex-col items-center animate-rise" style={{ animationDelay: "480ms" }}>
              <span className="text-xl font-bold text-gray-900 tabular-nums">{formatCompact(likes)}</span>
              <span className="text-xs text-gray-500 font-medium">Likes</span>
            </div>
          </div>

          {/* Coin Actions */}
          <div className="mt-6 flex gap-3 animate-rise" style={{ animationDelay: "520ms" }}>
            <button
              type="button"
              className="shimmer flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.97] hover:shadow-lg transition-all duration-200"
            >
              <Coins className="w-5 h-5" />
              Earn Coins
            </button>
            <button
              type="button"
              className="shimmer flex-1 bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-950 font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.97] hover:shadow-lg transition-all duration-200"
            >
              <ShoppingBag className="w-5 h-5" />
              Spend Coins
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        <div ref={feedRef} className="bg-gray-50 flex flex-col border-t border-gray-100">
          {/* Tab Navigation */}
          <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10">
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
          </div>

          {/* Tab Content */}
          <div className="flex flex-col gap-2 pt-2">
            {activeTab === "posts" && (
              <>
                <div
                  className={`transition-all duration-500 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </div>
                <div
                  className={`transition-all duration-500 delay-150 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </div>
              </>
            )}

            {activeTab === "liked" && (
              <>
                <div
                  className={`transition-all duration-500 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </div>
                <div
                  className={`transition-all duration-500 delay-150 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </div>
              </>
            )}

            {activeTab === "saved" && (
              <>
                <div
                  className={`transition-all duration-500 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </div>
                <div
                  className={`transition-all duration-500 delay-150 ${
                    feedVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <PostCard />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 6. Professional state sync mapping for the updated modal interface layout */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        currentName={profileName}
        currentUsername={profileUsername}
        currentLocation={profileLocation}
        currentAvatar={profileAvatar}
        currentCover={profileCover}
        currentUniversity={profileUniversity}
        currentLevel={profileLevel}
        currentDepartment={profileDepartment}
        currentGender={profileGender}
        currentRelationship={profileRelationship}
        currentPhone={profilePhone}
        currentHobbies={profileHobbies}
        currentBio={profileBio}
        onSave={async (updatedData) => {
          setProfileName(updatedData.name);
          setProfileUsername(updatedData.username);
          setProfileLocation(updatedData.location);
          setProfileAvatar(updatedData.avatar);
          setProfileCover(updatedData.cover);
          setProfileUniversity(updatedData.university);
          setProfileLevel(updatedData.level);
          setProfileDepartment(updatedData.department);
          setProfileGender(updatedData.gender);
          setProfileRelationship(updatedData.relationship);
          setProfilePhone(updatedData.phone);
          setProfileHobbies(updatedData.hobbies);
          setProfileBio(updatedData.bio);

          await updateProfile({
            full_name: updatedData.name,
            username: updatedData.username,
            bio: updatedData.bio,
            university: updatedData.university,
            level: updatedData.level,
            department: updatedData.department,
            gender: updatedData.gender,
            relationship: updatedData.relationship,
            phone: updatedData.phone,
            hobbies: updatedData.hobbies,
            avatar_url: updatedData.avatar,
            cover_url: updatedData.cover,
          });
        }}
      />

      <BottomNav />
    </div>
  );
}