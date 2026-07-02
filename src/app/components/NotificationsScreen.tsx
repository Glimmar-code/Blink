import { View, Text } from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Bell, Heart, MessageCircle, UserPlus, AtSign, Gift,
  RefreshCw, Eye, Users, Trophy, Check, ChevronRight,
  Sparkles, X, Bookmark, Share2,
  Repeat2, MessageSquare, ShieldCheck, Loader2,
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import {
  browserNotificationsSupported,
  requestBrowserNotificationPermission,
  showBrowserNotification,
} from "./notificationService";
import { BottomNav } from "./BottomNav";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType =
  | "follow"
  | "like_post"
  | "like_comment"
  | "reply_post"
  | "reply_comment"
  | "comment"
  | "mention"
  | "gift"
  | "update"
  | "profile_view"
  | "mutual_request"
  | "common_interest"
  | "rank"
  | "save"
  | "share"
  | "repost"
  | "community_add";

type VerifiedBadge = "blue" | "gold" | null;

type FilterTab =
  | "all"
  | "follows"
  | "likes"
  | "comments"
  | "mentions"
  | "reposts"
  | "saves"
  | "gifts"
  | "rank"
  | "system";

interface NotifUser {
  id: string;
  name: string;
  initials: string;
  username: string;
  gradientFrom: string;
  gradientTo: string;
  verified: VerifiedBadge;
}

interface Notification {
  id: string;
  type: NotifType;
  read: boolean;
  timestamp: string;
  user?: NotifUser;
  headline: string;
  subtext?: string;
  meta?: {
    rankNumber?: number;
    rankScope?: string;
    coinsAmount?: number;
    version?: string;
    communityName?: string;
  };
  avatarDestination?: string;
  destination: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const GRADIENTS: [string, string][] = [
  ["from-purple-500", "to-pink-500"],
  ["from-blue-500", "to-cyan-400"],
  ["from-orange-400", "to-rose-500"],
  ["from-emerald-500", "to-teal-400"],
  ["from-violet-500", "to-purple-400"],
  ["from-amber-400", "to-orange-500"],
  ["from-sky-500", "to-blue-400"],
  ["from-pink-500", "to-fuchsia-400"],
  ["from-green-500", "to-emerald-400"],
  ["from-red-500", "to-orange-400"],
  ["from-indigo-500", "to-violet-400"],
];

function mkUser(
  id: string,
  name: string,
  username: string,
  gi: number,
  verified: VerifiedBadge = null
): NotifUser {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return {
    id, name, initials, username, verified,
    gradientFrom: GRADIENTS[gi % GRADIENTS.length][0],
    gradientTo: GRADIENTS[gi % GRADIENTS.length][1],
  };
}

const TYPE_COLOR: Record<NotifType, string> = {
  follow: "bg-blue-500",
  like_post: "bg-red-500",
  like_comment: "bg-red-400",
  reply_post: "bg-green-500",
  reply_comment: "bg-green-400",
  comment: "bg-teal-500",
  mention: "bg-purple-500",
  gift: "bg-yellow-500",
  update: "bg-indigo-500",
  profile_view: "bg-cyan-500",
  mutual_request: "bg-pink-500",
  common_interest: "bg-orange-500",
  rank: "bg-amber-500",
  save: "bg-sky-500",
  share: "bg-violet-500",
  repost: "bg-emerald-500",
  community_add: "bg-rose-500",
};

function typeIcon(type: NotifType, size = 12) {
  switch (type) {
    case "follow": return <UserPlus size={size} />;
    case "like_post": case "like_comment": return <Heart size={size} />;
    case "reply_post": case "reply_comment": return <MessageCircle size={size} />;
    case "comment": return <MessageSquare size={size} />;
    case "mention": return <AtSign size={size} />;
    case "gift": return <Gift size={size} />;
    case "update": return <RefreshCw size={size} />;
    case "profile_view": return <Eye size={size} />;
    case "mutual_request": return <Users size={size} />;
    case "common_interest": return <Sparkles size={size} />;
    case "rank": return <Trophy size={size} />;
    case "save": return <Bookmark size={size} />;
    case "share": return <Share2 size={size} />;
    case "repost": return <Repeat2 size={size} />;
    case "community_add": return <ShieldCheck size={size} />;
  }
}

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "follows", label: "Follows" },
  { id: "likes", label: "Likes" },
  { id: "comments", label: "Comments" },
  { id: "reposts", label: "Reposts" },
  { id: "mentions", label: "Mentions" },
  { id: "saves", label: "Saves & Shares" },
  { id: "gifts", label: "Gifts" },
  { id: "rank", label: "Rank" },
  { id: "system", label: "System" },
];

function matchesFilter(n: Notification, filter: FilterTab): boolean {
  if (filter === "all") return true;
  if (filter === "follows") return n.type === "follow" || n.type === "mutual_request" || n.type === "common_interest";
  if (filter === "likes") return n.type === "like_post" || n.type === "like_comment";
  if (filter === "comments") return n.type === "comment" || n.type === "reply_post" || n.type === "reply_comment";
  if (filter === "reposts") return n.type === "repost";
  if (filter === "mentions") return n.type === "mention";
  if (filter === "saves") return n.type === "save" || n.type === "share";
  if (filter === "gifts") return n.type === "gift";
  if (filter === "rank") return n.type === "rank";
  if (filter === "system") return n.type === "update" || n.type === "profile_view" || n.type === "community_add";
  return true;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Notification[] = [
  {
    id: "1", type: "follow", read: false, timestamp: "2m ago",
    user: mkUser("u1", "Jessica Smith", "@jess_smith", 0, "blue"),
    headline: "Jessica Smith started following you",
    destination: "/followers", avatarDestination: "/profile/u1",
  },
  {
    id: "2", type: "like_post", read: false, timestamp: "5m ago",
    user: mkUser("u2", "Marcus J.", "@marcus_j", 1, "blue"),
    headline: "Marcus J. liked your post",
    subtext: '"Just wrapped up midterms! 🎉 The campus vibe…"',
    destination: "/post/123", avatarDestination: "/profile/u2",
  },
  {
    id: "3", type: "comment", read: false, timestamp: "8m ago",
    user: mkUser("u3", "Sarah K.", "@sarah_k", 2, null),
    headline: "Sarah K. commented on your post",
    subtext: '"This is so true, the library was packed 😂"',
    destination: "/post/123#comment-50", avatarDestination: "/profile/u3",
  },
  {
    id: "4", type: "repost", read: false, timestamp: "11m ago",
    user: mkUser("u4", "Mike O.", "@mike_o", 3, "gold"),
    headline: "Mike O. reposted your post",
    subtext: '"Just wrapped up midterms! 🎉"',
    destination: "/post/123", avatarDestination: "/profile/u4",
  },
  {
    id: "5", type: "save", read: false, timestamp: "14m ago",
    user: mkUser("u5", "David L.", "@david_l", 4, null),
    headline: "David L. saved your post",
    subtext: '"Campus study spots ranked 📚"',
    destination: "/post/119", avatarDestination: "/profile/u5",
  },
  {
    id: "6", type: "share", read: false, timestamp: "18m ago",
    user: mkUser("u6", "Aisha B.", "@aisha_b", 5, "blue"),
    headline: "Aisha B. shared your post",
    subtext: '"Top 10 study hacks for finals"',
    destination: "/post/115", avatarDestination: "/profile/u6",
  },
  {
    id: "7", type: "like_comment", read: true, timestamp: "25m ago",
    user: mkUser("u7", "Jordan T.", "@jordan_t", 6, null),
    headline: "Jordan T. liked your comment",
    subtext: '"Anyone down for a study group later?"',
    destination: "/post/120#comment-45", avatarDestination: "/profile/u7",
  },
  {
    id: "8", type: "reply_comment", read: true, timestamp: "35m ago",
    user: mkUser("u8", "Priya M.", "@priya_m", 7, "gold"),
    headline: "Priya M. replied to your comment",
    subtext: '"Count me in! Library at 6?"',
    destination: "/post/120#comment-46", avatarDestination: "/profile/u8",
  },
  {
    id: "9", type: "reply_post", read: true, timestamp: "1h ago",
    user: mkUser("u9", "Tyler R.", "@tyler_r", 8, null),
    headline: "Tyler R. replied to your post",
    subtext: '"This is exactly what the campus needed 👏"',
    destination: "/post/118#reply-12", avatarDestination: "/profile/u9",
  },
  {
    id: "10", type: "mention", read: true, timestamp: "1h ago",
    user: mkUser("u10", "Emma W.", "@emma_w", 9, "blue"),
    headline: "Emma W. mentioned you in a post",
    subtext: '"Huge thanks to @you for the campus guide 🙌"',
    destination: "/post/117", avatarDestination: "/profile/u10",
  },
  {
    id: "11", type: "community_add", read: true, timestamp: "2h ago",
    user: mkUser("u11", "Campus Hub", "@campus_hub", 10, "blue"),
    headline: "Campus Hub added you to a community",
    subtext: "Study Squad · 1.2k members",
    meta: { communityName: "Study Squad" },
    destination: "/community/study-squad", avatarDestination: "/profile/campus_hub",
  },
  {
    id: "12", type: "gift", read: true, timestamp: "2h ago",
    user: mkUser("u12", "Aisha B.", "@aisha_b", 5, "blue"),
    headline: "Aisha B. sent you a gift",
    subtext: "Keep up the great content! 🎁",
    meta: { coinsAmount: 50 },
    destination: "/wallet", avatarDestination: "/profile/u6",
  },
  {
    id: "13", type: "profile_view", read: true, timestamp: "3h ago",
    user: mkUser("u13", "Leo N.", "@leo_n", 0, null),
    headline: "Leo N. viewed your profile",
    destination: "/profile-views", avatarDestination: "/profile/u13",
  },
  {
    id: "14", type: "mutual_request", read: true, timestamp: "4h ago",
    user: mkUser("u14", "Zoe C.", "@zoe_c", 2, null),
    headline: "Zoe C. wants to connect with you",
    subtext: "You both know 4 people in common",
    destination: "/connections/requests", avatarDestination: "/profile/u14",
  },
  {
    id: "15", type: "common_interest", read: true, timestamp: "5h ago",
    user: mkUser("u15", "Noah P.", "@noah_p", 3, null),
    headline: "You and Noah P. have things in common",
    subtext: "Campus life · Study groups · Tech",
    destination: "/discover/noah_p", avatarDestination: "/profile/u15",
  },
  {
    id: "16", type: "rank", read: true, timestamp: "Yesterday",
    headline: "You're ranked #23 on the Campus Leaderboard",
    subtext: "Keep engaging to climb higher this week 🏆",
    meta: { rankNumber: 23, rankScope: "Campus" },
    destination: "/leaderboard",
  },
  {
    id: "17", type: "update", read: true, timestamp: "Yesterday",
    headline: "BlacApp v2.1 is now available",
    subtext: "Performance improvements & new campus features. Tap to update.",
    meta: { version: "2.1" },
    destination: "/update",
  },
];

const PAGE_SIZE = 8;

// ─── Sub-components ───────────────────────────────────────────────────────────

function VerifiedIcon({ type }: { type: VerifiedBadge }) {
  if (!type) return null;
  return (
    <Text
      className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-2 ${type === "blue" ? "bg-blue-500 ring-[#111]" : "bg-yellow-400 ring-[#111]"}`}
      title={type === "blue" ? "Verified" : "Gold Verified"}
    >
      <Check size={8} className="text-white font-black" strokeWidth={3} />
    </Text>
  );
}

function UserAvatar({ user, onAvatarClick, ringColor }: {
  user: NotifUser;
  onAvatarClick: () => void;
  ringColor: string;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onAvatarClick(); }}
      className="relative flex-shrink-0 active:scale-95 transition-transform"
      aria-label={`View ${user.name}'s profile`}
    >
      <View className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.gradientFrom} ${user.gradientTo} flex items-center justify-center text-white text-sm font-bold`}>
        {user.initials}
      </View>
      <VerifiedIcon type={user.verified} />
    </button>
  );
}

function SystemAvatar({ type }: { type: NotifType }) {
  return (
    <View className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[type]}`}>
      <Text className="text-white">{typeIcon(type, 22)}</Text>
    </View>
  );
}

function TypeBadge({ type, isDark }: { type: NotifType; isDark: boolean }) {
  return (
    <Text className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white ${TYPE_COLOR[type]} ring-2 ${isDark ? "ring-[#111]" : "ring-white"}`}>
      {typeIcon(type, 11)}
    </Text>
  );
}

function NotifRow({ notif, isDark, onTap, onAvatarTap }: {
  notif: Notification;
  isDark: boolean;
  onTap: () => void;
  onAvatarTap: () => void;
}) {
  const txt = isDark ? "text-white" : "text-gray-900";
  const sub = isDark ? "text-gray-400" : "text-gray-500";
  const ts = isDark ? "text-gray-600" : "text-gray-400";
  const unreadBg = isDark ? "bg-[#161622]" : "bg-blue-50/60";
  const border = isDark ? "border-[#1e1e1e]" : "border-gray-100";

  return (
    <motion.button
      onClick={onTap}
      className={`w-full flex items-start gap-3 px-4 py-3.5 border-b ${border} ${!notif.read ? unreadBg : ""} active:opacity-60 transition-opacity text-left`}
      layout
    >
      <View className="relative flex-shrink-0">
        {notif.user ? (
          <UserAvatar user={notif.user} onAvatarClick={onAvatarTap} ringColor={isDark ? "#111" : "#fff"} />
        ) : (
          <SystemAvatar type={notif.type} />
        )}
        <TypeBadge type={notif.type} isDark={isDark} />
      </View>

      <View className="flex-1 min-w-0">
        <Text className={`text-[13.5px] leading-snug ${txt} ${!notif.read ? "font-semibold" : "font-normal"}`}>
          {notif.headline}
          {notif.type === "gift" && notif.meta?.coinsAmount && (
            <Text className="ml-1.5 text-yellow-500"> 🪙 {notif.meta.coinsAmount}</Text>
          )}
          {notif.type === "rank" && notif.meta?.rankNumber && (
            <Text className="ml-1.5 text-amber-500">#{notif.meta.rankNumber}</Text>
          )}
        </Text>
        {notif.subtext && (
          <Text className={`text-xs mt-0.5 truncate ${sub}`}>{notif.subtext}</Text>
        )}
        <Text className={`text-[11px] mt-1 ${ts}`}>{notif.timestamp}</Text>
      </View>

      <View className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
        {!notif.read && <Text className="w-2 h-2 rounded-full bg-blue-500" />}
        <ChevronRight size={14} className={sub} />
      </View>
    </motion.button>
  );
}

function InAppToast({ notif, isDark, onDismiss, onTap }: {
  notif: Notification;
  isDark: boolean;
  onDismiss: () => void;
  onTap: () => void;
}) {
  return (
    <motion.div
      initial={{ y: -90, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -90, opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="absolute top-2 left-3 right-3 z-50"
    >
      <button
        onClick={onTap}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl shadow-2xl border ${isDark ? "bg-[#1c1c1e] border-[#2a2a2a]" : "bg-white border-gray-200"} text-left`}
      >
        <View className="relative flex-shrink-0">
          {notif.user ? (
            <View className={`w-10 h-10 rounded-full bg-gradient-to-br ${notif.user.gradientFrom} ${notif.user.gradientTo} flex items-center justify-center text-white text-xs font-bold`}>
              {notif.user.initials}
            </View>
          ) : (
            <View className={`w-10 h-10 rounded-full flex items-center justify-center ${TYPE_COLOR[notif.type]}`}>
              <Text className="text-white">{typeIcon(notif.type, 18)}</Text>
            </View>
          )}
          {notif.user && <VerifiedIcon type={notif.user.verified} />}
        </View>
        <View className="flex-1 min-w-0">
          <Text className={`text-[13px] font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
            {notif.headline}
          </Text>
          {notif.subtext && (
            <Text className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>{notif.subtext}</Text>
          )}
        </View>
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className={`p-1 rounded-full flex-shrink-0 ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          <X size={14} />
        </button>
      </button>
    </motion.div>
  );
}

// ─── Pull-to-refresh hook ─────────────────────────────────────────────────────

function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const pullY = useMotionValue(0);
  const arrowOpacity = useTransform(pullY, [0, 60], [0, 1]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (listRef.current && listRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pulling) return;
    const delta = Math.max(0, e.touches[0].clientY - startY.current);
    pullY.set(Math.min(delta * 0.4, 72));
  };

  const onTouchEnd = async () => {
    if (!pulling) return;
    setPulling(false);
    if (pullY.get() > 50) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    pullY.set(0);
  };

  return { listRef, pullY, arrowOpacity, refreshing, onTouchStart, onTouchMove, onTouchEnd };
}

// ─── Main component ───────────────────────────────────────────────────────────

export function NotificationsScreen() {
  const [allNotifs, setAllNotifs] = useState<Notification[]>(SEED);
  const [toast, setToast] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [navigatedTo, setNavigatedTo] = useState<string | null>(null);
  const filterScrollRef = useRef<HTMLDivElement>(null);

  const isDark = false;

  const unreadCount = allNotifs.filter((n) => !n.read).length;
  const filtered = allNotifs.filter((n) => matchesFilter(n, filter));
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const markAllRead = () => setAllNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setAllNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  const navigate = useNavigate();
  const handleNavigate = (path: string) => {
    setNavigatedTo(path);
    navigate(path);
    setTimeout(() => setNavigatedTo(null), 2000);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await new Promise((r) => setTimeout(r, 900));
    setPage((p) => p + 1);
    setLoadingMore(false);
  };

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1000));
    const fresh: Notification = {
      id: `refresh-${Date.now()}`,
      type: "like_post",
      read: false,
      timestamp: "Just now",
      user: mkUser("u99", "Alex G.", "@alex_g", 6, "blue"),
      headline: "Alex G. liked your post",
      subtext: '"Campus study spots ranked 📚"',
      destination: "/post/119",
      avatarDestination: "/profile/u99",
    };
    setAllNotifs((p) => [fresh, ...p.filter((n) => n.id !== fresh.id)]);
  }, []);

  const { listRef, pullY, arrowOpacity, refreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(handleRefresh);

  const spawnToast = useCallback((notif: Notification, notifyBrowser = true) => {
    setAllNotifs((p) => p.find((n) => n.id === notif.id) ? p : [notif, ...p]);
    setToast(notif);
    setTimeout(() => setToast(null), 4500);

    if (notifyBrowser) {
      showBrowserNotification({
        title: "BlacApp",
        body: notif.headline,
        path: "/notifications",
        tag: notif.id,
      });
    }
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!browserNotificationsSupported()) {
        return;
      }

      const permission = await requestBrowserNotificationPermission();
      if (permission !== "granted") {
        return;
      }
    };

    void initializeNotifications();

    const t = setTimeout(() => {
      spawnToast({
        id: "live-1",
        type: "repost",
        read: false,
        timestamp: "Just now",
        user: mkUser("u98", "Emma W.", "@emma_w", 9, "blue"),
        headline: "Emma W. reposted your post",
        subtext: '"Campus life is amazing today! 🎉"',
        destination: "/post/125",
        avatarDestination: "/profile/u98",
      });
    }, 2800);
    return () => clearTimeout(t);
  }, [spawnToast]);

  // Style tokens
  const bg = "bg-background";
  const headerBg = "bg-background";
  const border = "border-border";
  const txtPrimary = "text-foreground";
  const txtMuted = "text-muted-foreground";
  const markAllBtn = "bg-muted text-blue-600 dark:text-blue-400 border border-border";
  const filterPillActive = "bg-primary text-primary-foreground font-semibold";
  const filterPillInactive = "bg-card text-muted-foreground border border-border shadow-sm";
  const loadMoreBtn = "bg-card text-blue-600 dark:text-blue-400 border border-border shadow-sm";

  return (
                  <>

    <View className={`relative flex-1 flex flex-col h-full overflow-hidden ${bg}`}>

      {/* ── In-app toast ── */}
      <AnimatePresence>
        {toast && (
          <InAppToast
            notif={toast}
            isDark={isDark}
            onDismiss={() => setToast(null)}
            onTap={() => { markRead(toast.id); handleNavigate(toast.destination); setToast(null); }}
          />
        )}
      </AnimatePresence>

      {/* ── Nav feedback pill ── */}
      <AnimatePresence>
        {navigatedTo && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-black/80 text-white text-xs px-4 py-2 rounded-full whitespace-nowrap"
          >
            → {navigatedTo}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <View className={`flex items-center justify-between px-4 pt-14 pb-3 border-b ${border} ${headerBg}`}>
        <View className="flex items-center gap-2">
          <h1 className={`text-xl font-bold tracking-tight ${txtPrimary}`}>Activity</h1>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                key={unreadCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </View>

        <View className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-xl ${markAllBtn}`}
            >
              <Check size={11} />
              <Text>All read</Text>
            </button>
          )}
        </View>
      </View>

      {/* ── Swipeable filter tabs ── */}
      <View className={`border-b ${border} ${headerBg}`}>
        <View
          ref={filterScrollRef}
          className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {FILTER_TABS.map((tab) => {
            const count = tab.id === "all"
              ? allNotifs.filter((n) => !n.read).length
              : allNotifs.filter((n) => matchesFilter(n, tab.id) && !n.read).length;
            return (
              <button
                key={tab.id}
                onClick={() => { setFilter(tab.id); setPage(1); }}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12.5px] transition-all flex-shrink-0 ${filter === tab.id ? filterPillActive : filterPillInactive}`}
              >
                {tab.label}
                {count > 0 && (
                  <Text className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none ${filter === tab.id ? (isDark ? "bg-black/20 text-white" : "bg-white/20 text-white") : "bg-red-500 text-white"}`}>
                    {count}
                  </Text>
                )}
              </button>
            );
          })}
        </View>
      </View>

      {/* ── Pull-to-refresh indicator ── */}
      <motion.div
        className="flex items-center justify-center overflow-hidden"
        style={{ height: pullY }}
      >
        <motion.div style={{ opacity: arrowOpacity }}>
          {refreshing ? (
            <Loader2 size={18} className={`animate-spin ${txtMuted}`} />
          ) : (
            <RefreshCw size={18} className={txtMuted} />
          )}
        </motion.div>
      </motion.div>

      {/* ── Notification list ── */}
      <View
        ref={listRef}
        className="flex-1 overflow-y-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {refreshing && (
          <View className={`flex items-center justify-center gap-2 py-3 ${txtMuted}`}>
            <Loader2 size={14} className="animate-spin" />
            <Text className="text-xs">Refreshing…</Text>
          </View>
        )}

        {visible.length === 0 ? (
          <View className={`flex flex-col items-center justify-center h-48 gap-3 ${txtMuted}`}>
            <Bell size={36} className={isDark ? "text-gray-700" : "text-gray-300"} />
            <Text className="text-sm">
              {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
            </Text>
          </View>
        ) : (
          <View>
            <AnimatePresence initial={false}>
              {visible.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.2) }}
                >
                  <NotifRow
                    notif={notif}
                    isDark={isDark}
                    onTap={() => { markRead(notif.id); handleNavigate(notif.destination); }}
                    onAvatarTap={() => { if (notif.avatarDestination) handleNavigate(notif.avatarDestination); }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load more */}
            {hasMore ? (
              <View className="flex justify-center py-4 px-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${loadMoreBtn} disabled:opacity-50`}
                >
                  {loadingMore ? (
                    <><Loader2 size={14} className="animate-spin" /> Loading…</>
                  ) : (
                    <>Load more</>
                  )}
                </button>
              </View>
            ) : (
              <Text className={`text-center text-xs py-8 ${txtMuted}`}>
                You're all caught up ✓
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
                  <BottomNav />

                  </>

  );
}
