import { View, Text } from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Gift,
  Globe,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  Trophy,
  Zap,
  X,
  Crown,
  UserPlus,
  UserCheck,
  Check,
  Star,
  Flame,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNav } from "./BottomNav";
import { Avatar as UiAvatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type VerifiedType = "blue" | "yellow" | "none";
type TrendType = "up" | "down";
type TabType = "world" | "campus";

interface Student {
  id: string;
  rank: number;
  name: string;
  campus: string;
  avatar?: string;
  points: number;
  trend: TrendType;
  trendValue: number;
  verified: VerifiedType;
  isOnline: boolean;
  lastSeen?: string;
  isMe?: boolean;
}

const SEASON_END = new Date("2026-07-22T23:59:59");
const GIFT_AMOUNTS = [10, 20, 50, 100] as const;
type GiftAmount = (typeof GIFT_AMOUNTS)[number];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WORLD_TOP_20: Student[] = [
  { id: "w1", rank: 1, name: "Kofi Asante", campus: "MIT", points: 98420, trend: "up", trendValue: 2140, verified: "blue", isOnline: true },
  { id: "w2", rank: 2, name: "Amara Diallo", campus: "Stanford", points: 94830, trend: "up", trendValue: 890, verified: "yellow", isOnline: false, lastSeen: "2h ago" },
  { id: "w3", rank: 3, name: "Yusuf Al-Rashid", campus: "Oxford", points: 91200, trend: "down", trendValue: 340, verified: "blue", isOnline: true },
  { id: "w4", rank: 4, name: "Priya Nambiar", campus: "Cambridge", points: 88640, trend: "up", trendValue: 1560, verified: "none", isOnline: true },
  { id: "w5", rank: 5, name: "Lena Hoffmann", campus: "ETH Zurich", points: 85190, trend: "up", trendValue: 720, verified: "blue", isOnline: false, lastSeen: "5h ago" },
  { id: "w6", rank: 6, name: "Tariq Osei", campus: "Harvard", points: 82330, trend: "down", trendValue: 210, verified: "yellow", isOnline: true },
  { id: "w7", rank: 7, name: "Mei-Ling Zhou", campus: "Tsinghua", points: 79840, trend: "up", trendValue: 1890, verified: "blue", isOnline: true },
  { id: "w8", rank: 8, name: "Emeka Okonkwo", campus: "UCL", points: 76520, trend: "down", trendValue: 450, verified: "none", isOnline: false, lastSeen: "1d ago" },
  { id: "w9", rank: 9, name: "Sofia Andersson", campus: "KTH", points: 73980, trend: "up", trendValue: 640, verified: "yellow", isOnline: true },
  { id: "w10", rank: 10, name: "Diego Vargas", campus: "UNAM", points: 71250, trend: "up", trendValue: 380, verified: "none", isOnline: false, lastSeen: "3h ago" },
  { id: "w11", rank: 11, name: "Fatima Al-Zahra", campus: "AUB", points: 68700, trend: "down", trendValue: 920, verified: "blue", isOnline: true },
  { id: "w12", rank: 12, name: "Jin-Ho Park", campus: "KAIST", points: 65430, trend: "up", trendValue: 1100, verified: "none", isOnline: true },
  { id: "w13", rank: 13, name: "Nneka Chukwu", campus: "Wits", points: 63180, trend: "up", trendValue: 430, verified: "yellow", isOnline: false, lastSeen: "6h ago" },
  { id: "w14", rank: 14, name: "Arjun Sharma", campus: "IIT Delhi", points: 60940, trend: "down", trendValue: 280, verified: "none", isOnline: true },
  { id: "w15", rank: 15, name: "Leila Moradi", campus: "Sharif", points: 58720, trend: "up", trendValue: 670, verified: "blue", isOnline: false, lastSeen: "4h ago" },
  { id: "w16", rank: 16, name: "Chidi Eze", campus: "UNILAG", points: 56380, trend: "up", trendValue: 1230, verified: "none", isOnline: true },
  { id: "w17", rank: 17, name: "Astrid Bjornsen", campus: "NTNU", points: 54100, trend: "down", trendValue: 180, verified: "yellow", isOnline: false, lastSeen: "2d ago" },
  { id: "w18", rank: 18, name: "Rashida Kamara", campus: "Fourah Bay", points: 51860, trend: "up", trendValue: 560, verified: "none", isOnline: true },
  { id: "w19", rank: 19, name: "Tomasz Kowalski", campus: "Warsaw Tech", points: 49520, trend: "down", trendValue: 340, verified: "blue", isOnline: false, lastSeen: "1h ago" },
  { id: "w20", rank: 20, name: "Amina Traoré", campus: "UCAD", points: 47280, trend: "up", trendValue: 820, verified: "none", isOnline: true },
];

const ME_WORLD: Student = {
  id: "me",
  rank: 47,
  name: "You",
  campus: "Your Campus",
  points: 24180,
  trend: "up",
  trendValue: 320,
  verified: "none",
  isOnline: true,
  isMe: true,
};

const CAMPUS_TOP_20: Student[] = [
  { id: "c1", rank: 1, name: "Tobi Adeyemi", campus: "CS Dept", points: 52840, trend: "up", trendValue: 1420, verified: "blue", isOnline: true },
  { id: "c2", rank: 2, name: "Ngozi Obi", campus: "Engineering", points: 49320, trend: "down", trendValue: 380, verified: "yellow", isOnline: false, lastSeen: "1h ago" },
  { id: "c3", rank: 3, name: "Samuel Taiwo", campus: "Medicine", points: 46700, trend: "up", trendValue: 940, verified: "blue", isOnline: true },
  { id: "c4", rank: 4, name: "Blessing Ike", campus: "Law", points: 43890, trend: "up", trendValue: 620, verified: "none", isOnline: true },
  { id: "c5", rank: 5, name: "Kemi Afolabi", campus: "Sciences", points: 41230, trend: "down", trendValue: 190, verified: "yellow", isOnline: false, lastSeen: "3h ago" },
  { id: "c6", rank: 6, name: "Dayo Ogundimu", campus: "CS Dept", points: 38760, trend: "up", trendValue: 1080, verified: "none", isOnline: true },
  { id: "c7", rank: 7, name: "Funmilayo Eko", campus: "Architecture", points: 36410, trend: "up", trendValue: 450, verified: "blue", isOnline: false, lastSeen: "5h ago" },
  { id: "c8", rank: 8, name: "Ola Badmus", campus: "Business", points: 34180, trend: "down", trendValue: 730, verified: "none", isOnline: true },
  { id: "c9", rank: 9, name: "Temi Adeleke", campus: "Pharmacy", points: 31950, trend: "up", trendValue: 290, verified: "yellow", isOnline: true },
  { id: "c10", rank: 10, name: "Ifeoma Nwosu", campus: "Sciences", points: 29640, trend: "down", trendValue: 420, verified: "none", isOnline: false, lastSeen: "2h ago" },
  { id: "c11", rank: 11, name: "Gbenga Owolabi", campus: "CS Dept", points: 27380, trend: "up", trendValue: 870, verified: "blue", isOnline: true },
  { id: "me-c", rank: 12, name: "You", campus: "CS Dept", points: 24180, trend: "up", trendValue: 320, verified: "none", isOnline: true, isMe: true },
  { id: "c13", rank: 13, name: "Seun Fashola", campus: "Engineering", points: 22940, trend: "down", trendValue: 160, verified: "none", isOnline: false, lastSeen: "4h ago" },
  { id: "c14", rank: 14, name: "Adaeze Eze", campus: "Medicine", points: 20710, trend: "up", trendValue: 540, verified: "yellow", isOnline: true },
  { id: "c15", rank: 15, name: "Femi Olusanya", campus: "Law", points: 18490, trend: "up", trendValue: 380, verified: "none", isOnline: false, lastSeen: "1d ago" },
  { id: "c16", rank: 16, name: "Yemi Coker", campus: "Business", points: 16280, trend: "down", trendValue: 240, verified: "none", isOnline: true },
  { id: "c17", rank: 17, name: "Sola Akintola", campus: "Architecture", points: 14070, trend: "up", trendValue: 690, verified: "blue", isOnline: false, lastSeen: "6h ago" },
  { id: "c18", rank: 18, name: "Bimbo Fashola", campus: "Pharmacy", points: 11860, trend: "down", trendValue: 110, verified: "none", isOnline: true },
  { id: "c19", rank: 19, name: "Rotimi Alade", campus: "Sciences", points: 9640, trend: "up", trendValue: 420, verified: "none", isOnline: false, lastSeen: "3h ago" },
  { id: "c20", rank: 20, name: "Chisom Onyeka", campus: "Engineering", points: 7420, trend: "down", trendValue: 280, verified: "yellow", isOnline: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS: [string, string][] = [
  ["#6366f1", "#8b5cf6"],
  ["#06b6d4", "#3b82f6"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#06b6d4"],
  ["#ec4899", "#8b5cf6"],
  ["#f97316", "#eab308"],
  ["#14b8a6", "#6366f1"],
  ["#e879f9", "#f43f5e"],
];

function getGradient(name: string): [string, string] {
  const idx = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return n.toString();
}

function useCountdown(target: Date) {
  const calc = useCallback(() => {
    const d = target.getTime() - Date.now();
    if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  }, [target]);

  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ student, size = 44 }: { student: Student; size?: number }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [c1, c2] = getGradient(student.name);
  const initials = student.isMe
    ? "ME"
    : student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const avatarUrl = student.avatar ?? (student.isMe ? profile?.avatar_url ?? undefined : undefined);

  const handleAvatarClick = () => {
    if (student.isMe) {
      navigate("/profile");
    } else {
      const username = student.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
      navigate(`/profile/${username}`);
    }
  };

  return (
    <button
      onClick={handleAvatarClick}
      className="relative flex-shrink-0 active:scale-95 transition-transform text-left"
      style={{ width: size, height: size }}
      aria-label={`View ${student.name}'s profile`}
    >
      <UiAvatar style={{ width: size, height: size }}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={student.name} />
        ) : (
          <AvatarFallback
            style={{
              background: student.isMe
                ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                : `linear-gradient(135deg, ${c1}, ${c2})`,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: size * 0.33,
              fontFamily: "'Chakra Petch', monospace",
            }}
          >
            {initials}
          </AvatarFallback>
        )}
      </UiAvatar>
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: 1,
          right: 1,
          width: size * 0.27,
          height: size * 0.27,
          background: student.isOnline ? "#22c55e" : "#374151",
          border: "2px solid #080c14",
        }}
        animate={student.isOnline ? { scale: [1, 1.25, 1], opacity: [1, 0.65, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
      />
    </button>
  );
}

// ─── Verified Badge ───────────────────────────────────────────────────────────

function VerifiedBadge({ type }: { type: VerifiedType }) {
  if (type === "none") return null;
  return (
    <Text
      className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full flex-shrink-0"
      style={{ background: type === "blue" ? "#3b82f6" : "#f59e0b" }}
    >
      {type === "blue" ? (
        <Check size={8} className="text-white" strokeWidth={3} />
      ) : (
        <Star size={8} style={{ color: "white", fill: "white" }} />
      )}
    </Text>
  );
}

// ─── Rank Display ─────────────────────────────────────────────────────────────

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <View className="flex flex-col items-center justify-center w-8 flex-shrink-0">
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <Crown size={15} style={{ color: "#fbbf24" }} />
        </motion.div>
        <Text
          className="text-[10px] font-bold leading-none"
          style={{ color: "#fbbf24", fontFamily: "'Chakra Petch', monospace" }}
        >
          1st
        </Text>
      </View>
    );
  if (rank === 2)
    return (
      <View className="flex items-center justify-center w-8 flex-shrink-0">
        <Text
          className="text-base font-bold"
          style={{ color: "#9ca3af", fontFamily: "'Chakra Petch', monospace" }}
        >
          2
        </Text>
      </View>
    );
  if (rank === 3)
    return (
      <View className="flex items-center justify-center w-8 flex-shrink-0">
        <Text
          className="text-base font-bold"
          style={{ color: "#cd7c4d", fontFamily: "'Chakra Petch', monospace" }}
        >
          3
        </Text>
      </View>
    );
  return (
    <View className="flex items-center justify-center w-8 flex-shrink-0">
      <Text
        className="text-sm font-bold"
        style={{
          color: rank <= 10 ? "#818cf8" : "#4b5563",
          fontFamily: "'Chakra Petch', monospace",
        }}
      >
        {rank}
      </Text>
    </View>
  );
}

// ─── Student Row ──────────────────────────────────────────────────────────────

function StudentRow({
  student,
  index,
  followed,
  onFollow,
  onGift,
  rowRef,
}: {
  student: Student;
  index: number;
  followed: boolean;
  onFollow: (id: string) => void;
  onGift: (s: Student) => void;
  rowRef?: React.Ref<HTMLDivElement>;
}) {
  const isTop3 = student.rank <= 3;
  const isMe = !!student.isMe;

  const borderColor = isMe
    ? "rgba(99,102,241,0.45)"
    : isTop3
    ? student.rank === 1
      ? "rgba(251,191,36,0.25)"
      : student.rank === 2
      ? "rgba(156,163,175,0.2)"
      : "rgba(205,124,77,0.2)"
    : "transparent";

  const bgColor = isMe
    ? "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.09))"
    : isTop3
    ? "rgba(255,255,255,0.03)"
    : "transparent";

  return (
    <motion.div
      ref={rowRef}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl relative"
      style={{ border: `1px solid ${borderColor}`, background: bgColor }}
      initial={{ opacity: 0, y: 18 }}
      animate={
        student.rank === 1
          ? {
              opacity: 1,
              y: 0,
              boxShadow: [
                "0 0 0px rgba(251,191,36,0)",
                "0 0 18px rgba(251,191,36,0.12)",
                "0 0 0px rgba(251,191,36,0)",
              ],
            }
          : { opacity: 1, y: 0 }
      }
      transition={
        student.rank === 1
          ? {
              opacity: { delay: index * 0.04, duration: 0.35 },
              y: { delay: index * 0.04, duration: 0.35 },
              boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 },
            }
          : { delay: index * 0.04, duration: 0.35, ease: "easeOut" }
      }
      whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
    >
      <RankDisplay rank={student.rank} />
      <Avatar student={student} size={40} />

      <View className="flex-1 min-w-0">
        <View className="flex items-center gap-1.5">
          <Text
            className={`font-semibold text-sm truncate ${isMe ? "text-indigo-300" : "text-white"}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {student.name}
          </Text>
          <VerifiedBadge type={student.verified} />
        </View>
        <View className="flex items-center gap-1.5 mt-0.5">
          <Text className="text-[11px] text-gray-500 truncate">{student.campus}</Text>
          <Text className="text-gray-700 text-[10px]">·</Text>
          <Text
            className="text-[11px] font-medium"
            style={{ color: student.isOnline ? "#22c55e" : "#4b5563" }}
          >
            {student.isOnline ? "Active" : student.lastSeen ?? "Offline"}
          </Text>
        </View>
      </View>

      <View className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <Text
          className="text-sm font-bold text-white"
          style={{ fontFamily: "'Chakra Petch', monospace" }}
        >
          {fmt(student.points)}
        </Text>
        <Text
          className={`text-[10px] flex items-center gap-0.5 font-semibold ${
            student.trend === "up" ? "text-emerald-400" : "text-rose-400"
          }`}
          style={{ fontFamily: "'Chakra Petch', monospace" }}
        >
          {student.trend === "up" ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
          {fmt(student.trendValue)}
        </Text>
      </View>

      {!isMe && (
        <motion.button
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            background: followed ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.06)",
            color: followed ? "#818cf8" : "#6b7280",
          }}
          whileTap={{ scale: 0.84 }}
          onClick={() => onFollow(student.id)}
          title={followed ? "Unfollow" : "Follow"}
        >
          {followed ? <UserCheck size={13} /> : <UserPlus size={13} />}
        </motion.button>
      )}

      {!isMe && (
        <motion.button
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}
          whileTap={{ scale: 0.84 }}
          whileHover={{ color: "#f59e0b" }}
          onClick={() => onGift(student)}
          title="Send gift tokens"
        >
          <Gift size={13} />
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Gift Modal ───────────────────────────────────────────────────────────────

function GiftModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const [selected, setSelected] = useState<GiftAmount | null>(null);
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!selected) return;
    setSent(true);
    setTimeout(onClose, 1800);
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ padding: "0 0 16px" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <View
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      />
      <motion.div
        className="relative w-full rounded-2xl p-5"
        style={{
          maxWidth: 400,
          background: "#0f1626",
          border: "1px solid rgba(99,102,241,0.3)",
          margin: "0 16px",
        }}
        initial={{ y: 120, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 120, opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>

        <View className="flex items-center gap-3 mb-5">
          <Avatar student={student} size={40} />
          <View>
            <Text className="text-[11px] text-gray-500 uppercase tracking-wider">Send tokens to</Text>
            <Text
              className="font-semibold text-white text-sm mt-0.5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {student.name}
            </Text>
          </View>
        </View>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div key="select" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
              <Text className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                Select amount
              </Text>
              <View className="grid grid-cols-4 gap-2 mb-4">
                {GIFT_AMOUNTS.map((amt) => (
                  <motion.button
                    key={amt}
                    className="py-3 rounded-xl font-bold text-sm flex flex-col items-center gap-1"
                    style={{
                      fontFamily: "'Chakra Petch', monospace",
                      background:
                        selected === amt
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : "rgba(255,255,255,0.05)",
                      color: selected === amt ? "white" : "#6b7280",
                      border: `1px solid ${selected === amt ? "#6366f1" : "rgba(255,255,255,0.07)"}`,
                    }}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ borderColor: "rgba(99,102,241,0.4)" }}
                    onClick={() => setSelected(amt)}
                  >
                    <Text className="text-base">🎁</Text>
                    <Text>{amt}</Text>
                  </motion.button>
                ))}
              </View>
              <motion.button
                className="w-full py-3 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: selected
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.07)",
                  opacity: selected ? 1 : 0.45,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                disabled={!selected}
                whileTap={selected ? { scale: 0.97 } : {}}
                onClick={handleSend}
              >
                {selected ? `Send ${selected} Tokens` : "Select an amount"}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              className="flex flex-col items-center py-5 gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
            >
              <motion.div
                className="text-4xl"
                animate={{ rotate: [0, -12, 12, -6, 6, 0] }}
                transition={{ duration: 0.55 }}
              >
                🎁
              </motion.div>
              <Text className="text-white font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {selected} tokens sent!
              </Text>
              <Text className="text-gray-500 text-xs">To {student.name}</Text>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Season Rewards ───────────────────────────────────────────────────────────

const REWARD_ITEMS = [
  { id: "boost", Icon: Zap, label: "Boost Points", desc: "+500 XP daily boost", color: "#f59e0b", preClained: false },
  { id: "login", Icon: Flame, label: "Daily Login", desc: "+100 XP for logging in", color: "#06b6d4", preClained: true },
  { id: "post", Icon: Star, label: "Post Claim", desc: "+250 XP for first post", color: "#ec4899", preClained: false },
  { id: "shield", Icon: Shield, label: "Streak Shield", desc: "Protect your streak today", color: "#8b5cf6", preClained: false },
];

function SeasonRewards({
  countdown,
}: {
  countdown: { days: number; hours: number; minutes: number; seconds: number };
}) {
  const [claimed, setClaimed] = useState<Record<string, boolean>>({ login: true });

  return (
    <View>
      <View
        className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Clock size={12} className="text-indigo-400 flex-shrink-0" />
        <Text className="text-[11px] text-gray-500">Season ends in</Text>
        <View className="flex items-center gap-0.5 ml-auto">
          {(
            [
              { v: countdown.days, l: "d" },
              { v: countdown.hours, l: "h" },
              { v: countdown.minutes, l: "m" },
              { v: countdown.seconds, l: "s" },
            ] as const
          ).map(({ v, l }, i) => (
            <View key={l} className="flex items-center">
              <motion.span
                className="text-white font-bold text-[11px] min-w-[16px] text-right tabular-nums"
                style={{ fontFamily: "'Chakra Petch', monospace" }}
                key={v}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                {String(v).padStart(2, "0")}
              </motion.span>
              <Text className="text-gray-600 text-[10px]">{l}</Text>
              {i < 3 && <Text className="text-gray-700 text-[10px] mx-0.5">:</Text>}
            </View>
          ))}
        </View>
      </View>

      <View className="space-y-2">
        {REWARD_ITEMS.map(({ id, Icon, label, desc, color, preClained }, i) => {
          const isClaimed = claimed[id] ?? preClained;
          return (
            <motion.div
              key={id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.055)",
              }}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
            >
              <View
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}
              >
                <Icon size={15} style={{ color }} />
              </View>
              <View className="flex-1 min-w-0">
                <Text
                  className="text-white text-xs font-semibold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {label}
                </Text>
                <Text className="text-gray-600 text-[10px]">{desc}</Text>
              </View>
              <motion.button
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: isClaimed ? "rgba(255,255,255,0.04)" : `${color}22`,
                  color: isClaimed ? "#374151" : color,
                  border: `1px solid ${isClaimed ? "rgba(255,255,255,0.06)" : `${color}44`}`,
                  cursor: isClaimed ? "default" : "pointer",
                }}
                disabled={isClaimed}
                whileTap={!isClaimed ? { scale: 0.92 } : {}}
                onClick={() => !isClaimed && setClaimed((p) => ({ ...p, [id]: true }))}
              >
                {isClaimed ? "Claimed ✓" : "Claim"}
              </motion.button>
            </motion.div>
          );
        })}
      </View>
    </View>
  );
}

// ─── LeaderboardScreen ────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<TabType>("world");
  const [showRewards, setShowRewards] = useState(false);
  const [giftTarget, setGiftTarget] = useState<Student | null>(null);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [myCardVisible, setMyCardVisible] = useState(true);
  const myCardRef = useRef<HTMLDivElement | null>(null);
  const countdown = useCountdown(SEASON_END);

  const students = tab === "world" ? WORLD_TOP_20 : CAMPUS_TOP_20;
  const myInList = tab === "campus";
  const myStudent: Student =
    tab === "world" ? ME_WORLD : (CAMPUS_TOP_20.find((s) => s.isMe) ?? ME_WORLD);

  const toggleFollow = useCallback((id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    setMyCardVisible(true);
  }, [tab]);

  useEffect(() => {
    const el = myCardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setMyCardVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [tab]);

  return (
    <View
      className="relative flex flex-col h-full overflow-hidden bg-background text-foreground"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {/* ── Header ── */}
      <View className="px-4 pt-5 pb-0 flex-shrink-0">
        <View className="flex items-start justify-between mb-4">
          <View>
            <View className="flex items-center gap-2">
              <Trophy size={18} style={{ color: "#6366f1" }} />
              <h1
                className="text-lg font-bold text-white tracking-tight"
                style={{ fontFamily: "'Chakra Petch', monospace" }}
              >
                LEADERBOARD
              </h1>
            </View>
            <Text className="text-[11px] text-gray-600 mt-0.5 ml-6">Season 4 · Global Rankings</Text>
          </View>
          <motion.button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold"
            style={{
              background: showRewards ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.06)",
              color: showRewards ? "#a5b4fc" : "#6b7280",
              border: `1px solid ${showRewards ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setShowRewards((v) => !v)}
          >
            {showRewards ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            Season Rewards
          </motion.button>
        </View>

        {/* Countdown strip */}
        <motion.div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl mb-3"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
            border: "1px solid rgba(99,102,241,0.18)",
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <View
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <Clock size={11} style={{ color: "#818cf8" }} />
          </View>
          <Text className="text-[11px] text-gray-500">Season ends</Text>
          <View className="flex items-center gap-0.5 ml-auto">
            {(
              [
                { v: countdown.days, l: "d" },
                { v: countdown.hours, l: "h" },
                { v: countdown.minutes, l: "m" },
                { v: countdown.seconds, l: "s" },
              ] as const
            ).map(({ v, l }, i) => (
              <View key={l} className="flex items-center">
                <motion.span
                  className="text-white font-bold text-xs min-w-[18px] text-right tabular-nums"
                  style={{ fontFamily: "'Chakra Petch', monospace" }}
                  key={v}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {String(v).padStart(2, "0")}
                </motion.span>
                <Text className="text-[11px]" style={{ color: "#4b5563" }}>{l}</Text>
                {i < 3 && <Text className="text-[11px] mx-0.5" style={{ color: "#374151" }}>:</Text>}
              </View>
            ))}
          </View>
        </motion.div>

        {/* Season Rewards Panel */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              className="rounded-2xl overflow-hidden mb-3"
              style={{ background: "#0d1423", border: "1px solid rgba(99,102,241,0.2)" }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            >
              <View className="p-4">
                <SeasonRewards countdown={countdown} />
              </View>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <View
          className="flex p-1 rounded-2xl mb-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {(["world", "campus"] as TabType[]).map((t) => (
            <button
              key={t}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold relative transition-colors"
              style={{
                color: tab === t ? "white" : "#4b5563",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
              onClick={() => setTab(t)}
            >
              {tab === t && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  layoutId="tab-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Text className="relative z-10 flex items-center gap-1.5">
                {t === "world" ? <Globe size={12} /> : <Building2 size={12} />}
                {t === "world" ? "World Rank" : "Campus Rank"}
              </Text>
            </button>
          ))}
        </View>
      </View>

      {/* ── List ── */}
      <View
        className="flex-1 overflow-y-auto px-3 pb-40 space-y-1 pt-1"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {students.map((student, i) => (
              <StudentRow
                key={student.id}
                student={student}
                index={i}
                followed={followed.has(student.id)}
                onFollow={toggleFollow}
                onGift={setGiftTarget}
                rowRef={student.isMe ? myCardRef : undefined}
              />
            ))}

            {!myInList && (
              <>
                <View className="flex items-center gap-3 py-3 px-2">
                  <View className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <Text className="text-[11px] text-gray-700 tracking-widest">• • •</Text>
                  <View className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                </View>
                <StudentRow
                  student={ME_WORLD}
                  index={22}
                  followed={false}
                  onFollow={() => {}}
                  onGift={() => {}}
                  rowRef={myCardRef}
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </View>

      {/* ── Sticky My Rank ── */}
      <AnimatePresence>
        {!myCardVisible && (
          <motion.div
            className="absolute bottom-16 left-0 right-0 px-3 pb-4"
            style={{ maxWidth: 480, margin: "0 auto" }}
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <View
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.16))",
                border: "1px solid rgba(99,102,241,0.5)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <Text
                className="text-xs font-bold text-indigo-400 w-8 text-center flex-shrink-0"
                style={{ fontFamily: "'Chakra Petch', monospace" }}
              >
                #{myStudent.rank}
              </Text>
              <Avatar student={myStudent} size={34} />
              <View className="flex-1 min-w-0">
                <Text
                  className="text-indigo-300 text-xs font-semibold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Your Rank
                </Text>
                <Text className="text-gray-600 text-[10px]">{myStudent.campus}</Text>
              </View>
              <View className="flex flex-col items-end flex-shrink-0">
                <Text
                  className="text-white font-bold text-sm"
                  style={{ fontFamily: "'Chakra Petch', monospace" }}
                >
                  {fmt(myStudent.points)}
                </Text>
                <Text
                  className="text-emerald-400 text-[10px] flex items-center gap-0.5 font-semibold"
                  style={{ fontFamily: "'Chakra Petch', monospace" }}
                >
                  <TrendingUp size={8} />
                  +{fmt(myStudent.trendValue)}
                </Text>
              </View>
            </View>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gift Modal ── */}
      <AnimatePresence>
        {giftTarget && <GiftModal student={giftTarget} onClose={() => setGiftTarget(null)} />}
      </AnimatePresence>

      <BottomNav />
    </View>
  );
}
