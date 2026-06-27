import { useState, useCallback } from "react";
import {
  RefreshCw,
  MessageCircle,
  UserPlus,
  UserCheck,
  Search,
  Hash,
  TrendingUp,
  Clock,
  ChevronDown,
  Shuffle,
  BadgeCheck,
  Heart,
  MessageSquare,
  Repeat2,
  Share,
  MoreHorizontal,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Badge = "none" | "white" | "blue";

interface UserProfile {
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

interface Post {
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

interface Tag {
  id: string;
  name: string;
  count: number;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const USERS: UserProfile[] = [
  {
    id: "1",
    name: "Amara Osei",
    username: "amara_o",
    university: "Howard University",
    level: "Junior",
    relationshipStatus: "Single",
    gender: "Female",
    avatar: "AO",
    badge: "blue",
    isActive: true,
    followers: 1240,
    bio: "Pre-med • Campus ambassador • Coffee addict ☕",
  },
  {
    id: "2",
    name: "Jordan Blake",
    username: "j_blake",
    university: "MIT",
    level: "Senior",
    relationshipStatus: "Taken",
    gender: "Male",
    avatar: "JB",
    badge: "white",
    isActive: false,
    followers: 892,
    bio: "CS + Math double major. Building cool stuff.",
  },
  {
    id: "3",
    name: "Zara Mensah",
    username: "zara.m",
    university: "UCLA",
    level: "Freshman",
    relationshipStatus: "Single",
    gender: "Female",
    avatar: "ZM",
    badge: "none",
    isActive: true,
    followers: 345,
    bio: "Film studies 🎬 First year, figuring it out.",
  },
  {
    id: "4",
    name: "Kwame Asante",
    username: "kwame_a",
    university: "Stanford",
    level: "Graduate",
    relationshipStatus: "Single",
    gender: "Male",
    avatar: "KA",
    badge: "blue",
    isActive: true,
    followers: 3100,
    bio: "PhD candidate in Electrical Engineering. Researcher.",
  },
  {
    id: "5",
    name: "Riley Chen",
    username: "riley.chen",
    university: "NYU",
    level: "Sophomore",
    relationshipStatus: "It's Complicated",
    gender: "Non-binary",
    avatar: "RC",
    badge: "white",
    isActive: false,
    followers: 670,
    bio: "Art history + Music production. NYC native 🗽",
  },
  {
    id: "6",
    name: "Destiny Williams",
    username: "destinyW",
    university: "Harvard",
    level: "Senior",
    relationshipStatus: "Single",
    gender: "Female",
    avatar: "DW",
    badge: "blue",
    isActive: true,
    followers: 4800,
    bio: "Premed • HBCU proud • Aspiring surgeon 🩺",
  },
  {
    id: "7",
    name: "Marcus Lee",
    username: "marcusl",
    university: "Howard University",
    level: "Junior",
    relationshipStatus: "Taken",
    gender: "Male",
    avatar: "ML",
    badge: "none",
    isActive: true,
    followers: 520,
    bio: "Political science major. Debate team captain.",
  },
  {
    id: "8",
    name: "Nia Jackson",
    username: "nia_j",
    university: "UCLA",
    level: "Graduate",
    relationshipStatus: "Single",
    gender: "Female",
    avatar: "NJ",
    badge: "blue",
    isActive: false,
    followers: 2300,
    bio: "MBA candidate. Entrepreneur. Startup life 🚀",
  },
];

const POSTS: Post[] = [
  {
    id: "p1",
    user: USERS[0],
    content:
      "Just aced my biochemistry midterm! The campus study rooms were packed but worth it 🙌 Anyone else feeling the midterm grind? #MidtermSzn #PreMed",
    tags: ["MidtermSzn", "PreMed"],
    likes: 284,
    comments: 41,
    reposts: 18,
    time: "2h",
  },
  {
    id: "p2",
    user: USERS[3],
    content:
      "New research paper dropped! Our lab just published on neural signal processing. Link in bio. So grateful for this team 🔬 #Research #GradLife",
    tags: ["Research", "GradLife"],
    likes: 612,
    comments: 87,
    reposts: 134,
    time: "4h",
    image: "lab",
  },
  {
    id: "p3",
    user: USERS[5],
    content:
      "Campus vibes are immaculate today ✨ Fall semester is giving everything. Who's at the quad right now? #CampusLife #HarvardMoments",
    tags: ["CampusLife", "HarvardMoments"],
    likes: 1203,
    comments: 96,
    reposts: 45,
    time: "1h",
  },
  {
    id: "p4",
    user: USERS[6],
    content:
      "Debate practice was intense tonight. We're prepping for nationals and the pressure is real. Shoutout to the whole team 💪 #Debate #CampusLife",
    tags: ["Debate", "CampusLife"],
    likes: 198,
    comments: 27,
    reposts: 12,
    time: "6h",
  },
  {
    id: "p5",
    user: USERS[4],
    content:
      "NYC in the fall hits different when you're running on 4 hours of sleep and a deadline 😂 The art history paper will NOT write itself #NYU #StudentLife",
    tags: ["NYU", "StudentLife"],
    likes: 445,
    comments: 63,
    reposts: 29,
    time: "3h",
  },
];

const TAGS: Tag[] = [
  { id: "t1", name: "CampusLife", count: 8420 },
  { id: "t2", name: "MidtermSzn", count: 5130 },
  { id: "t3", name: "StudyGroup", count: 3870 },
  { id: "t4", name: "GradLife", count: 2950 },
  { id: "t5", name: "PreMed", count: 2310 },
  { id: "t6", name: "Research", count: 1890 },
  { id: "t7", name: "StudentLife", count: 1640 },
  { id: "t8", name: "HBCU", count: 1220 },
];

// Avatar color map
const AVATAR_COLORS: Record<string, string> = {
  AO: "bg-violet-500",
  JB: "bg-sky-600",
  ZM: "bg-pink-500",
  KA: "bg-emerald-600",
  RC: "bg-amber-500",
  DW: "bg-rose-500",
  ML: "bg-indigo-600",
  NJ: "bg-teal-600",
};

// ─── Small helpers ─────────────────────────────────────────────────────────────

function VerifiedBadge({ badge }: { badge: Badge }) {
  if (badge === "none") return null;
  return (
    <BadgeCheck
      size={14}
      className={badge === "blue" ? "text-blue-500" : "text-muted-foreground"}
      fill={badge === "blue" ? "#3b82f6" : "currentColor"}
      strokeWidth={2.5}
      color="var(--background)"
    />
  );
}

function Avatar({
  user,
  size = "md",
  onClick,
}: {
  user: UserProfile;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };
  const dotSize = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3" };
  return (
    <div className="relative flex-shrink-0" onClick={onClick}>
      <div
        className={`${sizeClasses[size]} ${AVATAR_COLORS[user.avatar] || "bg-muted-foreground"} rounded-full flex items-center justify-center font-bold text-white ${onClick ? "cursor-pointer" : ""}`}
      >
        {user.avatar}
      </div>
      {user.isActive && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize[size]} bg-green-500 rounded-full border-2 border-background`}
        />
      )}
    </div>
  );
}

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function Dropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-left shadow-sm"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">
            {label}
          </span>
          <span className="text-foreground font-semibold text-xs leading-none truncate max-w-[90px]">
            {value}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm ${value === opt ? "bg-foreground text-background font-semibold" : "text-foreground hover:bg-muted"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Partner Finder ───────────────────────────────────────────────────────────

const UNIVERSITIES = [
  "Any University",
  "Howard University",
  "MIT",
  "Harvard",
  "Stanford",
  "UCLA",
  "NYU",
];
const GENDERS = ["Any Gender", "Male", "Female", "Non-binary"];
const STATUSES = ["Any Status", "Single", "Taken", "It's Complicated"];
const LEVELS = [
  "Any Level",
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate",
];

function PartnerFinder({ onGoToProfile, onGoToDM }: { onGoToProfile: (id: string) => void; onGoToDM: (id: string) => void }) {
  const [university, setUniversity] = useState("Any University");
  const [gender, setGender] = useState("Any Gender");
  const [status, setStatus] = useState("Any Status");
  const [level, setLevel] = useState("Any Level");
  const [spinning, setSpinning] = useState(false);
  const [matched, setMatched] = useState<UserProfile | null>(null);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
    {}
  );

  const getFollowers = (u: UserProfile) =>
    followerCounts[u.id] ?? u.followers;

  const spin = useCallback(() => {
    setSpinning(true);
    setMatched(null);
    setTimeout(() => {
      let pool = USERS.filter((u) => {
        if (university !== "Any University" && u.university !== university)
          return false;
        if (gender !== "Any Gender" && u.gender !== gender) return false;
        if (status !== "Any Status" && u.relationshipStatus !== status)
          return false;
        if (level !== "Any Level" && u.level !== level) return false;
        return true;
      });
      if (pool.length === 0) pool = USERS;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setMatched(pick);
      setSpinning(false);
    }, 900);
  }, [university, gender, status, level]);

  const toggleFollow = (u: UserProfile) => {
    const isFollowed = followed[u.id];
    setFollowed((f) => ({ ...f, [u.id]: !isFollowed }));
    setFollowerCounts((c) => ({
      ...c,
      [u.id]: (c[u.id] ?? u.followers) + (isFollowed ? -1 : 1),
    }));
  };

  return (
    <div className="mb-6">
      {/* Header card */}
      <div className="bg-foreground rounded-2xl px-4 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Shuffle size={16} className="text-background" />
          <h2 className="text-background font-bold text-base">Find a Match</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Dropdown
            label="University"
            options={UNIVERSITIES}
            value={university}
            onChange={setUniversity}
          />
          <Dropdown
            label="Gender"
            options={GENDERS}
            value={gender}
            onChange={setGender}
          />
          <Dropdown
            label="Status"
            options={STATUSES}
            value={status}
            onChange={setStatus}
          />
          <Dropdown
            label="Level"
            options={LEVELS}
            value={level}
            onChange={setLevel}
          />
        </div>
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full bg-background text-foreground rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={spinning ? "animate-spin" : ""}
          />
          {spinning ? "Finding someone…" : "Spin & Match"}
        </button>
      </div>

      {/* Match result */}
      {spinning && (
        <div className="mt-3 bg-card rounded-2xl border border-border p-4 flex items-center justify-center h-32 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw size={22} className="text-muted-foreground animate-spin" />
            <span className="text-muted-foreground text-sm">Looking for your match…</span>
          </div>
        </div>
      )}

      {matched && !spinning && (
        <div className="mt-3 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {/* Top strip */}
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar
                user={matched}
                size="lg"
                onClick={() => onGoToProfile(matched.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-foreground text-base">
                    {matched.name}
                  </span>
                  <VerifiedBadge badge={matched.badge} />
                </div>
                <span className="text-muted-foreground text-xs">@{matched.username}</span>
                <p className="text-foreground/80 text-xs mt-1 leading-relaxed">
                  {matched.bio}
                </p>
              </div>
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                matched.university,
                matched.level,
                matched.relationshipStatus,
              ].map((info) => (
                <span
                  key={info}
                  className="bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-full"
                >
                  {info}
                </span>
              ))}
              <span className="bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-full">
                {formatCount(getFollowers(matched))} followers
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => toggleFollow(matched)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  followed[matched.id]
                    ? "bg-muted text-foreground"
                    : "bg-foreground text-background"
                }`}
              >
                {followed[matched.id] ? (
                  <>
                    <UserCheck size={15} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={15} /> Follow
                  </>
                )}
              </button>
              <button
                onClick={() => onGoToDM(matched.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold bg-muted text-foreground transition-colors hover:bg-muted/80"
              >
                <MessageCircle size={15} /> Message
              </button>
              <button
                onClick={spin}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                title="Re-spin"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onGoToProfile }: { post: Post; onGoToProfile: (id: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((l) => !l);
    setLikeCount((c) => c + (liked ? -1 : 1));
  };

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <Avatar user={post.user} size="sm" onClick={() => onGoToProfile(post.user.id)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => onGoToProfile(post.user.id)}
            >
              <span className="font-semibold text-sm text-foreground">
                {post.user.name}
              </span>
              <VerifiedBadge badge={post.user.badge} />
              <span className="text-muted-foreground text-xs ml-1">· {post.time}</span>
            </div>
            <MoreHorizontal size={16} className="text-muted-foreground" />
          </div>
          <p className="text-foreground/90 text-sm mt-1 leading-relaxed">
            {post.content}
          </p>
          <div className="flex items-center gap-5 mt-2.5">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1 text-xs ${liked ? "text-rose-500" : "text-muted-foreground"}`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} />
              {formatCount(likeCount)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare size={15} />
              {formatCount(post.comments)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground">
              <Repeat2 size={15} />
              {formatCount(post.reposts)}
            </button>
            <button className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Share size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── People Card ──────────────────────────────────────────────────────────────

function PeopleCard({ user, onGoToProfile }: { user: UserProfile; onGoToProfile: (id: string) => void }) {
  const [followed, setFollowed] = useState(false);
  const [count, setCount] = useState(user.followers);

  const toggle = () => {
    setFollowed((f) => !f);
    setCount((c) => c + (followed ? -1 : 1));
  };

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar user={user} size="sm" onClick={() => onGoToProfile(user.id)} />
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onGoToProfile(user.id)}>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm text-foreground">
              {user.name}
            </span>
            <VerifiedBadge badge={user.badge} />
          </div>
          <span className="text-muted-foreground text-xs">@{user.username}</span>
          <p className="text-muted-foreground text-xs mt-0.5 truncate">{user.bio}</p>
          <div className="flex gap-2 mt-1">
            {[user.university, user.level].map((t) => (
              <span
                key={t}
                className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={toggle}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            followed
              ? "bg-muted text-foreground"
              : "bg-foreground text-background"
          }`}
        >
          {followed ? "Following" : "Follow"}
        </button>
      </div>
    </div>
  );
}

// ─── Tag Card ────────────────────────────────────────────────────────────────

function TagCard({ tag }: { tag: Tag }) {
  return (
    <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
        <Hash size={16} className="text-foreground" />
      </div>
      <div className="flex-1">
        <span className="font-semibold text-sm text-foreground">#{tag.name}</span>
        <p className="text-muted-foreground text-xs mt-0.5">
          {formatCount(tag.count)} posts
        </p>
      </div>
      <TrendingUp size={14} className="text-muted-foreground" />
    </div>
  );
}

// ─── Main ExploreScreen ───────────────────────────────────────────────────────

export function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "people" | "tags">(
    "posts"
  );
  const [sort, setSort] = useState<"trending" | "newest">("trending");

  // Simple navigation stubs (replace with real router if needed)
  const goToProfile = (id: string) => {
    console.log("Navigate to profile:", id);
  };
  const goToDM = (id: string) => {
    console.log("Open DM with:", id);
  };

  const filteredPosts = POSTS.filter(
    (p) =>
      !searchQuery ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      p.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPeople = USERS.filter(
    (u) =>
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTags = TAGS.filter(
    (t) =>
      !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPosts =
    sort === "newest"
      ? [...filteredPosts].sort((a, b) => a.time.localeCompare(b.time))
      : [...filteredPosts].sort((a, b) => b.likes - a.likes);

  const tabs: { key: "posts" | "people" | "tags"; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "people", label: "People" },
    { key: "tags", label: "Tags" },
  ];

  return (
    <div className="flex-1 bg-background flex flex-col pt-14 pb-20 h-full overflow-y-auto">
      {/* Page header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Explore</h1>
      </div>

      {/* Partner finder */}
      <div className="px-4 mt-1">
        <PartnerFinder onGoToProfile={goToProfile} onGoToDM={goToDM} />
      </div>

      {/* Divider label */}
      <div className="px-4 mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Discover
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, people, tags…"
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
          />
        </div>
      </div>

      {/* Trending tags strip */}
      {activeTab !== "tags" && (
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TAGS.slice(0, 6).map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setSearchQuery(tag.name);
                  setActiveTab("tags");
                }}
                className="flex-shrink-0 flex items-center gap-1 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-medium text-foreground/90 shadow-sm hover:bg-muted"
              >
                <Hash size={11} className="text-muted-foreground" />
                {tag.name}
                <span className="text-muted-foreground ml-0.5">
                  {formatCount(tag.count)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab bar + sort */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-14 z-20">
        <div className="flex items-center px-4">
          <div className="flex flex-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 text-sm font-semibold relative ${
                  activeTab === key
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {label}
                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>
          {activeTab !== "tags" && (
            <div className="flex items-center bg-muted rounded-full p-0.5 ml-auto">
              <button
                onClick={() => setSort("trending")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  sort === "trending"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <TrendingUp size={11} /> Trending
              </button>
              <button
                onClick={() => setSort("newest")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  sort === "newest"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <Clock size={11} /> Newest
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-background">
        {activeTab === "posts" &&
          (sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} onGoToProfile={goToProfile} />
            ))
          ) : (
            <EmptyState label="No posts found" />
          ))}

        {activeTab === "people" &&
          (filteredPeople.length > 0 ? (
            filteredPeople.map((user) => (
              <PeopleCard
                key={user.id}
                user={user}
                onGoToProfile={goToProfile}
              />
            ))
          ) : (
            <EmptyState label="No people found" />
          ))}

        {activeTab === "tags" &&
          (filteredTags.length > 0 ? (
            filteredTags.map((tag) => <TagCard key={tag.id} tag={tag} />)
          ) : (
            <EmptyState label="No tags found" />
          ))}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Search size={32} className="mb-3 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}