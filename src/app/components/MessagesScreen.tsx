import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "./UserProfile";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Search, Edit2, ChevronLeft, Phone, Video, Info,
  Smile, Paperclip, Mic, Send, Camera, FileText,
  Users, BarChart2, Plus, X, Check, CheckCheck,
  Pin, Copy, Trash2, Share2, Flag, Reply,
  Crown, Shield, UserPlus, Play,
  ChevronRight, UserCheck,
  Image as ImageIcon, Gift
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type VerifiedType = "blue" | "yellow" | null;
type MessageType = "text" | "voice" | "image" | "gif" | "file" | "contact" | "poll";
type MemberRole = "owner" | "admin" | "member";
type ScreenView =
  | { view: "list" }
  | { view: "chat"; chatId: string }
  | { view: "profile"; userId: string }
  | { view: "group-info"; chatId: string }
  | { view: "create-group" };

interface IUser {
  id: string; name: string; username: string; avatar: string;
  verified: VerifiedType; online: boolean; lastSeen: string;
  bio: string; followers: number; following: number;
}
interface IReaction { emoji: string; users: string[]; }
interface IPollOption { text: string; votes: number; voters: string[]; }
interface IMessage {
  id: string; senderId: string; type: MessageType; content: string;
  timestamp: string; reactions: IReaction[]; replyToId?: string; pinned: boolean;
  voiceDuration?: number; pollQuestion?: string; pollOptions?: IPollOption[];
  fileName?: string; fileSize?: string; contactName?: string; contactPhone?: string;
  gifUrl?: string;
}
interface IGroupMember { userId: string; role: MemberRole; }
interface IChat {
  id: string; type: "dm" | "group"; name: string; avatar: string;
  verified?: VerifiedType; streak: number; unreadCount: number;
  lastMessage: string; lastTime: string;
  userId?: string; members?: IGroupMember[]; description?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ME = "me";
const QUICK_EMOJIS = ["❤️", "😂", "😮", "😢", "👍"];
const ALL_EMOJIS = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰",
  "😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳",
  "😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭",
  "😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔",
  "🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴",
  "🤤","😪","😵","🤐","🥴","🤢","🤧","🤮","🤑","🤠","👍","👎","❤️","🔥","⭐",
  "✨","💫","🎉","🎊","🎈","🥂","🍕","🍔","💯","🙏","👏","🤝","💪","🎯","🚀",
  "🌍","🌈","🦋","🌸","🍀","🎵","🎶","🏆","💎","👑","🔑","💡","⚡","🌙","☀️",
];
const GIF_URLS = [
  "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1549049950-48d5887197a0?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&h=150&fit=crop",
  "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=200&h=150&fit=crop",
];

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_USERS: IUser[] = [
  { id: "u1", name: "Aisha Bello", username: "aisha_b", avatar: "https://i.pravatar.cc/96?img=1", verified: "blue", online: true, lastSeen: "now", bio: "Designer & creative. Lagos 🇳🇬", followers: 4200, following: 312 },
  { id: "u2", name: "Chidi Okonkwo", username: "chidi_ok", avatar: "https://i.pravatar.cc/96?img=3", verified: "yellow", online: false, lastSeen: "5m ago", bio: "Software engineer. Coffee lover.", followers: 1800, following: 230 },
  { id: "u3", name: "Fatima Yusuf", username: "fatimay", avatar: "https://i.pravatar.cc/96?img=5", verified: null, online: true, lastSeen: "now", bio: "Medical student. Reader. Traveler.", followers: 890, following: 450 },
  { id: "u4", name: "Emeka Nwosu", username: "emeka_n", avatar: "https://i.pravatar.cc/96?img=7", verified: "blue", online: false, lastSeen: "1h ago", bio: "Entrepreneur. Building things.", followers: 12400, following: 500 },
  { id: "u5", name: "Ngozi Eze", username: "ngozi_e", avatar: "https://i.pravatar.cc/96?img=9", verified: null, online: true, lastSeen: "now", bio: "Artist | Photographer", followers: 3100, following: 280 },
  { id: "u6", name: "Tunde Adeyemi", username: "tunde_a", avatar: "https://i.pravatar.cc/96?img=11", verified: "yellow", online: true, lastSeen: "now", bio: "Content creator 📸", followers: 22000, following: 850 },
  { id: "u7", name: "Kelechi Ibe", username: "kelechi_i", avatar: "https://i.pravatar.cc/96?img=15", verified: null, online: false, lastSeen: "3h ago", bio: "Student. Coder. Gamer.", followers: 560, following: 340 },
  { id: "u8", name: "Ada Okafor", username: "ada_ok", avatar: "https://i.pravatar.cc/96?img=20", verified: "blue", online: true, lastSeen: "now", bio: "Journalist | Writer", followers: 8900, following: 620 },
  { id: "u9", name: "Seun Adeleke", username: "seun_a", avatar: "https://i.pravatar.cc/96?img=22", verified: null, online: false, lastSeen: "2d ago", bio: "Finance. Investing. Growth.", followers: 1200, following: 180 },
  { id: "u10", name: "Chisom Nze", username: "chisom_n", avatar: "https://i.pravatar.cc/96?img=24", verified: "yellow", online: true, lastSeen: "now", bio: "Fashion blogger 💃", followers: 31000, following: 920 },
];

const mkMsg = (id: string, senderId: string, type: MessageType, content: string, time: string, extras: Partial<IMessage> = {}): IMessage =>
  ({ id, senderId, type, content, timestamp: time, reactions: [], pinned: false, ...extras });

const INITIAL_CHATS: IChat[] = [
  { id: "c1", type: "dm", name: "Aisha Bello", avatar: "https://i.pravatar.cc/96?img=1", verified: "blue", streak: 12, unreadCount: 3, lastMessage: "Did you see the new library update? 🔥", lastTime: "2m", userId: "u1" },
  { id: "c2", type: "dm", name: "Chidi Okonkwo", avatar: "https://i.pravatar.cc/96?img=3", verified: "yellow", streak: 7, unreadCount: 0, lastMessage: "Yeah bro, let's link up tomorrow", lastTime: "18m", userId: "u2" },
  { id: "c3", type: "dm", name: "Fatima Yusuf", avatar: "https://i.pravatar.cc/96?img=5", verified: null, streak: 0, unreadCount: 1, lastMessage: "Can you send me the notes?", lastTime: "1h", userId: "u3" },
  { id: "c4", type: "dm", name: "Emeka Nwosu", avatar: "https://i.pravatar.cc/96?img=7", verified: "blue", streak: 30, unreadCount: 0, lastMessage: "The startup pitch went well!", lastTime: "2h", userId: "u4" },
  { id: "c5", type: "dm", name: "Ngozi Eze", avatar: "https://i.pravatar.cc/96?img=9", verified: null, streak: 5, unreadCount: 0, lastMessage: "Check out my new artwork 🎨", lastTime: "3h", userId: "u5" },
  { id: "c6", type: "dm", name: "Tunde Adeyemi", avatar: "https://i.pravatar.cc/96?img=11", verified: "yellow", streak: 21, unreadCount: 5, lastMessage: "New video just dropped!", lastTime: "4h", userId: "u6" },
  { id: "c7", type: "dm", name: "Kelechi Ibe", avatar: "https://i.pravatar.cc/96?img=15", verified: null, streak: 0, unreadCount: 0, lastMessage: "gg wp", lastTime: "1d", userId: "u7" },
  { id: "c8", type: "dm", name: "Ada Okafor", avatar: "https://i.pravatar.cc/96?img=20", verified: "blue", streak: 15, unreadCount: 2, lastMessage: "The article is published!", lastTime: "1d", userId: "u8" },
  { id: "c9", type: "dm", name: "Seun Adeleke", avatar: "https://i.pravatar.cc/96?img=22", verified: null, streak: 0, unreadCount: 0, lastMessage: "Check the market trends", lastTime: "2d", userId: "u9" },
  { id: "c10", type: "dm", name: "Chisom Nze", avatar: "https://i.pravatar.cc/96?img=24", verified: "yellow", streak: 8, unreadCount: 0, lastMessage: "Outfit of the day drop! 💃", lastTime: "2d", userId: "u10" },
  { id: "g1", type: "group", name: "CS 400L Study Group", avatar: "https://i.pravatar.cc/96?img=50", streak: 3, unreadCount: 8, lastMessage: "Emeka: Who has the past questions?", lastTime: "5m", description: "Final year Computer Science students", members: [{ userId: "me", role: "owner" }, { userId: "u1", role: "admin" }, { userId: "u2", role: "member" }, { userId: "u3", role: "member" }, { userId: "u4", role: "member" }, { userId: "u7", role: "member" }] },
  { id: "g2", type: "group", name: "Lagos Tech Hub 🚀", avatar: "https://i.pravatar.cc/96?img=51", streak: 14, unreadCount: 0, lastMessage: "Tunde: Next meetup is Friday!", lastTime: "2h", description: "Tech entrepreneurs & developers in Lagos", members: [{ userId: "me", role: "admin" }, { userId: "u4", role: "owner" }, { userId: "u6", role: "admin" }, { userId: "u2", role: "member" }, { userId: "u8", role: "member" }, { userId: "u9", role: "member" }, { userId: "u10", role: "member" }] },
  { id: "g3", type: "group", name: "Campus Creative Club", avatar: "https://i.pravatar.cc/96?img=52", streak: 0, unreadCount: 1, lastMessage: "Ngozi: New project idea!", lastTime: "1d", description: "Art, design, photography and creativity", members: [{ userId: "me", role: "member" }, { userId: "u5", role: "owner" }, { userId: "u10", role: "admin" }, { userId: "u1", role: "member" }, { userId: "u8", role: "member" }] },
];

const INITIAL_MESSAGES: Record<string, IMessage[]> = {
  c1: [
    mkMsg("m1", "u1", "text", "Hey! Did you see the new library update? 🔥", "10:00"),
    mkMsg("m2", ME, "text", "Not yet, what's new?", "10:01"),
    mkMsg("m3", "u1", "text", "They added support for concurrent rendering and the performance is insane!", "10:01", { reactions: [{ emoji: "🔥", users: ["me"] }] }),
    mkMsg("m4", ME, "text", "That's actually huge. Need to check that out ASAP", "10:02"),
    mkMsg("m5", "u1", "text", "Did you see the new library update? 🔥", "10:03"),
  ],
  c2: [
    mkMsg("m1", "u2", "text", "Bro that project deadline is tomorrow!", "Yesterday"),
    mkMsg("m2", ME, "text", "Yeah I know, almost done 😅", "Yesterday"),
    mkMsg("m3", "u2", "text", "Let's pair program tonight?", "Yesterday"),
    mkMsg("m4", ME, "text", "Yeah bro, let's link up tomorrow", "Yesterday"),
  ],
  c3: [
    mkMsg("m1", "u3", "text", "Hi Marcus! Hope you're good", "08:30"),
    mkMsg("m2", ME, "text", "I'm great! You?", "08:31"),
    mkMsg("m3", "u3", "text", "Can you send me the notes from the seminar?", "08:45"),
  ],
  c4: [
    mkMsg("m1", ME, "text", "How did the pitch go??", "14:00"),
    mkMsg("m2", "u4", "text", "The startup pitch went well! 🎉", "14:05", { reactions: [{ emoji: "🎉", users: ["me"] }, { emoji: "❤️", users: ["me"] }] }),
    mkMsg("m3", ME, "text", "That's amazing!! Congrats!", "14:06"),
  ],
  c5: [
    mkMsg("m1", "u5", "text", "Check out my new artwork!", "11:00"),
    mkMsg("m2", "u5", "image", "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop", "11:01"),
    mkMsg("m3", ME, "text", "This is incredible! 😍", "11:05"),
    mkMsg("m4", "u5", "text", "Thank you so much! 🎨", "11:06"),
  ],
  c6: [
    mkMsg("m1", "u6", "text", "New video just dropped on my channel!", "08:00"),
    mkMsg("m2", ME, "text", "Watching it now 🎬", "08:05"),
    mkMsg("m3", "u6", "voice", "", "08:06", { voiceDuration: 14 }),
    mkMsg("m4", ME, "text", "The editing is fire 🔥", "08:07"),
    mkMsg("m5", "u6", "text", "New video just dropped!", "08:08"),
  ],
  c7: [
    mkMsg("m1", "u7", "text", "GG!", "23:00"),
    mkMsg("m2", ME, "text", "gg wp", "23:01"),
  ],
  c8: [
    mkMsg("m1", "u8", "text", "Just published a piece on campus innovation!", "12:00"),
    mkMsg("m2", ME, "text", "Sending the link to everyone!", "12:05"),
    mkMsg("m3", "u8", "text", "The article is published! 📰", "12:10"),
    mkMsg("m4", ME, "text", "Amazing work! 👏", "12:11"),
  ],
  c9: [
    mkMsg("m1", "u9", "text", "Have you looked at the crypto market lately?", "2d ago"),
    mkMsg("m2", ME, "text", "Not really, what's happening?", "2d ago"),
    mkMsg("m3", "u9", "text", "Check the market trends", "2d ago"),
  ],
  c10: [
    mkMsg("m1", "u10", "text", "New fashion collection just dropped! 👗", "2d ago"),
    mkMsg("m2", ME, "text", "Looking amazing as always!", "2d ago"),
    mkMsg("m3", "u10", "text", "Outfit of the day drop! 💃", "2d ago"),
  ],
  g1: [
    mkMsg("m1", "u2", "text", "Who has the algorithms past questions?", "09:00"),
    mkMsg("m2", "u1", "text", "I have 2019-2022, check DM", "09:02"),
    mkMsg("m3", "u3", "text", "Can someone share the study schedule?", "09:15"),
    mkMsg("m4", ME, "text", "I'll create a Google Doc and share it here", "09:20"),
    mkMsg("m5", "u4", "text", "Who has the past questions?", "09:22"),
    mkMsg("m6", ME, "poll", "", "09:30", { pollQuestion: "When should we have our next study session?", pollOptions: [{ text: "Today 5pm", votes: 3, voters: ["u1", "u2", "u3"] }, { text: "Tomorrow 10am", votes: 2, voters: ["u4", "me"] }, { text: "This weekend", votes: 1, voters: ["u7"] }] }),
  ],
  g2: [
    mkMsg("m1", "u6", "text", "Next meetup is Friday at the Hub!", "10:00"),
    mkMsg("m2", "u4", "text", "Perfect, I'll present the pitch deck", "10:05"),
    mkMsg("m3", ME, "text", "I'm in! What time exactly?", "10:10"),
    mkMsg("m4", "u6", "text", "6pm. Bring your laptops", "10:11"),
    mkMsg("m5", "u9", "text", "Will there be food? 😂", "10:12", { reactions: [{ emoji: "😂", users: ["me", "u4", "u6"] }] }),
    mkMsg("m6", "u6", "text", "Tunde: Next meetup is Friday!", "10:15"),
  ],
  g3: [
    mkMsg("m1", "u5", "text", "New project idea for the exhibition!", "Yesterday"),
    mkMsg("m2", "u10", "text", "Tell us more!", "Yesterday"),
    mkMsg("m3", "u5", "text", "A photography series on campus life - real moments", "Yesterday"),
    mkMsg("m4", "u1", "text", "I love this idea. Count me in", "Yesterday"),
    mkMsg("m5", ME, "text", "Same, this sounds incredible", "Yesterday"),
    mkMsg("m6", "u5", "text", "Ngozi: New project idea!", "Yesterday"),
  ],
};

let msgCounter = 1000;
const genId = () => `m${++msgCounter}`;

// ─── Utility Components ───────────────────────────────────────────────────────

function VerifiedBadge({ type }: { type: VerifiedType }) {
  if (!type) return null;
  return (
    <svg className={`w-4 h-4 shrink-0 ${type === "blue" ? "text-blue-500" : "text-amber-500"}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function Avatar({ src, name, size = 48, online }: { src: string; name: string; size?: number; online?: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img src={src} alt={name} className="rounded-full object-cover w-full h-full border-2 border-white shadow-sm" />
      {online && (
        <span className="absolute bottom-0 right-0 flex" style={{ width: Math.max(10, size * 0.22), height: Math.max(10, size * 0.22) }}>
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex w-full h-full bg-green-500 border-2 border-white rounded-full" />
        </span>
      )}
    </div>
  );
}

// ─── Context Menu Overlay ─────────────────────────────────────────────────────

interface ContextMenuProps {
  msg: IMessage;
  isMine: boolean;
  isPinned: boolean;
  pinnedCount: number;
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onForward: () => void;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
  onReport: () => void;
  senderName: string;
}

function ContextMenuOverlay({ msg, isMine, isPinned, pinnedCount, onClose, onReact, onReply, onForward, onCopy, onPin, onDelete, onReport, senderName }: ContextMenuProps) {
  const [showFullEmoji, setShowFullEmoji] = useState(false);

  const actions = [
    { icon: Reply, label: "Reply", action: onReply, color: "text-gray-700" },
    { icon: Share2, label: "Forward", action: onForward, color: "text-gray-700" },
    ...(msg.type === "text" ? [{ icon: Copy, label: "Copy", action: onCopy, color: "text-gray-700" }] : []),
    { icon: Pin, label: isPinned ? "Unpin" : "Pin", action: onPin, color: "text-gray-700", disabled: !isPinned && pinnedCount >= 3 },
    ...(isMine ? [{ icon: Trash2, label: "Delete", action: onDelete, color: "text-red-500" }] : []),
    { icon: Flag, label: "Report", action: onReport, color: "text-red-500" },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        className="relative bg-white rounded-t-3xl shadow-2xl pb-6"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Message preview */}
        <div className="mx-4 mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-1">{isMine ? "You" : senderName}</p>
          <p className="text-sm text-gray-800 line-clamp-2">
            {msg.type === "text" ? msg.content : msg.type === "voice" ? "🎤 Voice note" : msg.type === "image" ? "📷 Photo" : msg.type === "poll" ? `📊 ${msg.pollQuestion}` : msg.type === "file" ? `📎 ${msg.fileName}` : msg.content}
          </p>
        </div>

        {/* Emoji reactions */}
        <AnimatePresence mode="wait">
          {showFullEmoji ? (
            <motion.div
              key="full"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 mb-4"
            >
              <div className="grid grid-cols-10 gap-1 max-h-44 overflow-y-auto py-2">
                {ALL_EMOJIS.map((em, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.7 }}
                    className="text-xl flex items-center justify-center h-8 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => { onReact(em); onClose(); }}
                  >
                    {em}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="quick" className="flex items-center gap-3 px-4 mb-4">
              {QUICK_EMOJIS.map((em, i) => (
                <motion.button
                  key={em}
                  whileHover={{ scale: 1.3, y: -4 }}
                  whileTap={{ scale: 0.8 }}
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 20 }}
                  className="text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => { onReact(em); onClose(); }}
                >
                  {em}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: "spring" }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                onClick={() => setShowFullEmoji(true)}
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="px-4 grid grid-cols-4 gap-2">
          {actions.map(({ icon: Icon, label, action, color, disabled }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              whileTap={{ scale: 0.92 }}
              disabled={disabled}
              onClick={() => { action(); onClose(); }}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors ${disabled ? "opacity-30" : ""} ${color}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Forward Modal ────────────────────────────────────────────────────────────

function ForwardModal({ chats, onForward, onClose }: { chats: IChat[]; onForward: (chatId: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-4 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Forward to</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..." className="bg-transparent text-sm flex-1 outline-none text-gray-800 placeholder-gray-400" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-3 flex flex-col gap-2">
          {filtered.map(chat => (
            <button key={chat.id} onClick={() => setSelected(chat.id === selected ? null : chat.id)}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${selected === chat.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}`}>
              <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-sm text-gray-900 truncate">{chat.name}</p>
                  <VerifiedBadge type={chat.verified ?? null} />
                </div>
                <p className="text-xs text-gray-400 truncate">{chat.lastMessage}</p>
              </div>
              {selected === chat.id && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div>}
            </button>
          ))}
        </div>
        <div className="px-4 pb-6 pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!selected}
            onClick={() => { if (selected) { onForward(selected); onClose(); } }}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-40 transition-all hover:bg-blue-700"
          >
            Send
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Poll Creator ─────────────────────────────────────────────────────────────

function PollCreator({ onSend, onClose }: { onSend: (question: string, options: string[]) => void; onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white rounded-t-3xl shadow-2xl"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-lg">Create Poll</h3>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4 text-gray-600" /></button>
          </div>
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..." className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none border border-gray-200 mb-3" />
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Options</p>
          <div className="flex flex-col gap-2 mb-3">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${i + 1}`} className="flex-1 p-3 bg-gray-50 rounded-xl text-sm outline-none border border-gray-200" />
                {options.length > 2 && <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="p-1.5 rounded-full bg-gray-100 hover:bg-red-50"><X className="w-3.5 h-3.5 text-gray-500" /></button>}
              </div>
            ))}
          </div>
          {options.length < 4 && (
            <button onClick={() => setOptions([...options, ""])} className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-4">
              <Plus className="w-4 h-4" /> Add option
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
            onClick={() => { onSend(question, options.filter(o => o.trim())); onClose(); }}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Create Poll
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── GIF Picker ───────────────────────────────────────────────────────────────

function GifPicker({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white rounded-t-3xl shadow-2xl"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-4 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 text-lg">GIFs</h3>
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4 text-gray-600" /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {GIF_URLS.map((url, i) => (
              <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { onSelect(url); onClose(); }}
                className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                <img src={url} alt="gif" className="w-full h-full object-cover" />
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">GIF</div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Contact Picker ───────────────────────────────────────────────────────────

function ContactPicker({ users, onSelect, onClose }: { users: IUser[]; onSelect: (user: IUser) => void; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative bg-white rounded-t-3xl shadow-2xl max-h-[60vh] flex flex-col"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-4 pb-2 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Send Contact</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4 text-gray-600" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 pb-6 flex flex-col gap-2">
          {users.map(user => (
            <button key={user.id} onClick={() => { onSelect(user); onClose(); }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MsgBubbleProps {
  msg: IMessage;
  isMine: boolean;
  senderAvatar?: string;
  senderName?: string;
  replyToMsg?: IMessage;
  onLongPress: (msg: IMessage) => void;
  onReply: (msg: IMessage) => void;
  isGroup?: boolean;
  onVotePoll?: (msgId: string, optIdx: number) => void;
}

function MessageBubble({ msg, isMine, senderAvatar, senderName, replyToMsg, onLongPress, onReply, isGroup, onVotePoll }: MsgBubbleProps) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    isDragging.current = false;
    pressTimer.current = setTimeout(() => {
      if (!isDragging.current) onLongPress(msg);
    }, 500);
  }, [msg, onLongPress]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (Math.abs(e.clientX - startX.current) > 6) {
      isDragging.current = true;
      if (pressTimer.current) clearTimeout(pressTimer.current);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  }, []);

  const totalReactions = msg.reactions.reduce((s, r) => s + r.users.length, 0);

  return (
    <div className={`flex gap-2 mb-1 ${isMine ? "flex-row-reverse" : "flex-row"} items-end`}>
      {!isMine && isGroup && senderAvatar && (
        <img src={senderAvatar} alt={senderName} className="w-6 h-6 rounded-full object-cover shrink-0 mb-4" />
      )}

      <motion.div
        drag="x"
        dragConstraints={isMine ? { right: 0, left: -70 } : { left: 0, right: 70 }}
        dragElastic={{ left: isMine ? 0.3 : 0, right: isMine ? 0 : 0.3 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          const threshold = isMine ? -50 : 50;
          if ((isMine && info.offset.x < threshold) || (!isMine && info.offset.x > threshold)) {
            onReply(msg);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`flex flex-col max-w-[72%] cursor-pointer select-none ${isMine ? "items-end" : "items-start"}`}
      >
        {!isMine && isGroup && senderName && (
          <p className="text-[10px] font-bold text-blue-600 mb-1 ml-1">{senderName}</p>
        )}

        {/* Reply preview */}
        {replyToMsg && (
          <div className={`mb-1 px-3 py-1.5 rounded-xl border-l-4 border-blue-400 bg-gray-100 text-xs text-gray-500 max-w-full ${isMine ? "items-end" : ""}`}>
            <p className="font-semibold text-blue-600 text-[10px]">{replyToMsg.senderId === ME ? "You" : senderName}</p>
            <p className="truncate">{replyToMsg.type === "text" ? replyToMsg.content : `📎 ${replyToMsg.type}`}</p>
          </div>
        )}

        {/* Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={`relative rounded-2xl overflow-hidden ${
            isMine
              ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-sm"
              : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
          } ${msg.type === "image" || msg.type === "gif" ? "p-0" : "px-3.5 py-2.5"}`}
        >
          {msg.pinned && (
            <div className={`flex items-center gap-1 text-[9px] font-bold mb-1 ${isMine ? "text-blue-200" : "text-amber-500"}`}>
              <Pin className="w-2.5 h-2.5" /> Pinned
            </div>
          )}

          {msg.type === "text" && <p className="text-sm leading-relaxed break-words">{msg.content}</p>}

          {(msg.type === "image" || msg.type === "gif") && (
            <div className="relative">
              <img src={msg.gifUrl || msg.content} alt="media" className="max-w-full rounded-2xl max-h-52 object-cover" />
              {msg.type === "gif" && <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">GIF</div>}
            </div>
          )}

          {msg.type === "voice" && (
            <div className="flex items-center gap-3 min-w-[160px]">
              <button className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMine ? "bg-blue-400" : "bg-blue-50"}`}>
                <Play className={`w-4 h-4 ${isMine ? "text-white" : "text-blue-600"}`} />
              </button>
              <div className="flex-1 flex items-center gap-0.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className={`rounded-full flex-1 ${isMine ? "bg-blue-300" : "bg-blue-200"}`}
                    style={{ height: `${8 + Math.sin(i * 0.8) * 6 + Math.random() * 4}px` }} />
                ))}
              </div>
              <span className={`text-[10px] shrink-0 ${isMine ? "text-blue-200" : "text-gray-400"}`}>{msg.voiceDuration}s</span>
            </div>
          )}

          {msg.type === "file" && (
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isMine ? "bg-blue-400" : "bg-blue-50"}`}>
                <FileText className={`w-4 h-4 ${isMine ? "text-white" : "text-blue-600"}`} />
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{msg.fileName}</p>
                <p className={`text-[10px] ${isMine ? "text-blue-200" : "text-gray-400"}`}>{msg.fileSize}</p>
              </div>
            </div>
          )}

          {msg.type === "contact" && (
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isMine ? "bg-blue-400" : "bg-gray-100"}`}>
                <UserCheck className={`w-4 h-4 ${isMine ? "text-white" : "text-gray-600"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold">{msg.contactName}</p>
                <p className={`text-[10px] ${isMine ? "text-blue-200" : "text-gray-400"}`}>{msg.contactPhone}</p>
              </div>
            </div>
          )}

          {msg.type === "poll" && msg.pollOptions && (
            <div className="min-w-[200px]">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart2 className={`w-4 h-4 ${isMine ? "text-blue-200" : "text-blue-500"}`} />
                <p className="font-semibold text-sm">{msg.pollQuestion}</p>
              </div>
              {msg.pollOptions.map((opt, i) => {
                const total = msg.pollOptions!.reduce((s, o) => s + o.votes, 0);
                const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                const voted = opt.voters.includes(ME);
                return (
                  <motion.button key={i} whileTap={{ scale: 0.98 }}
                    onClick={() => onVotePoll?.(msg.id, i)}
                    className={`w-full mb-1.5 p-2.5 rounded-xl border text-left relative overflow-hidden transition-all ${
                      voted ? (isMine ? "border-blue-300 bg-blue-400/20" : "border-blue-400 bg-blue-50") : (isMine ? "border-blue-400/30 bg-blue-400/10" : "border-gray-100 bg-gray-50")
                    }`}>
                    <div className="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between">
                      <span className="text-xs font-medium">{opt.text}</span>
                      <span className="text-xs font-bold opacity-60">{pct}%</span>
                    </div>
                  </motion.button>
                );
              })}
              <p className={`text-[10px] mt-1 ${isMine ? "text-blue-200" : "text-gray-400"}`}>{msg.pollOptions.reduce((s, o) => s + o.votes, 0)} votes</p>
            </div>
          )}

          {/* Timestamp + read status */}
          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] ${isMine ? "text-blue-200" : "text-gray-400"}`}>{msg.timestamp}</span>
            {isMine && <CheckCheck className="w-3 h-3 text-blue-200" />}
          </div>
        </motion.div>

        {/* Reactions */}
        {totalReactions > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
            {msg.reactions.map(r => r.users.length > 0 && (
              <motion.div key={r.emoji} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-sm">
                <span className="text-xs">{r.emoji}</span>
                {r.users.length > 1 && <span className="text-[10px] font-bold text-gray-600">{r.users.length}</span>}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Chat Input Bar ───────────────────────────────────────────────────────────

interface ChatInputProps {
  replyTo: IMessage | null;
  onClearReply: () => void;
  onSend: (text: string) => void;
  onSendVoice: () => void;
  onSendGif: () => void;
  onSendPoll: () => void;
  onSendContact: () => void;
  onOpenCamera: () => void;
  onSendFile: () => void;
  replyToSenderName?: string;
}

function ChatInputBar({ replyTo, onClearReply, onSend, onSendVoice, onSendGif, onSendPoll, onSendContact, onOpenCamera, onSendFile, replyToSenderName }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordSecs(0);
    recordInterval.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordInterval.current) clearInterval(recordInterval.current);
    setRecordSecs(0);
    onSendVoice();
  };

  const attachOptions = [
    { icon: Camera, label: "Camera", color: "bg-rose-500", action: onOpenCamera },
    { icon: ImageIcon, label: "Gallery", color: "bg-purple-500", action: () => {} },
    { icon: FileText, label: "File", color: "bg-blue-500", action: onSendFile },
    { icon: Users, label: "Contact", color: "bg-teal-500", action: onSendContact },
    { icon: BarChart2, label: "Poll", color: "bg-orange-500", action: onSendPoll },
    { icon: Gift, label: "GIF", color: "bg-pink-500", action: onSendGif },
  ];

  return (
    <div className="bg-white border-t border-gray-100 px-3 py-2 shrink-0">
      <AnimatePresence>
        {replyTo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 rounded-xl border-l-4 border-blue-400">
            <Reply className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-blue-600">{replyToSenderName || "You"}</p>
              <p className="text-xs text-gray-600 truncate">{replyTo.type === "text" ? replyTo.content : replyTo.type}</p>
            </div>
            <button onClick={onClearReply} className="p-1 rounded-full hover:bg-blue-100 transition-colors"><X className="w-3.5 h-3.5 text-gray-500" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAttach && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="grid grid-cols-6 gap-2 mb-3 overflow-hidden">
            {attachOptions.map(({ icon: Icon, label, color, action }, i) => (
              <motion.button key={label} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.04, type: "spring" }}
                whileTap={{ scale: 0.88 }} onClick={() => { action(); setShowAttach(false); }}
                className="flex flex-col items-center gap-1">
                <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[9px] font-semibold text-gray-500">{label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording ? (
        <div className="flex items-center gap-3 py-1">
          <button onClick={() => { setIsRecording(false); if (recordInterval.current) clearInterval(recordInterval.current); setRecordSecs(0); }}
            className="p-2.5 rounded-full bg-gray-100 text-gray-500"><X className="w-4 h-4" /></button>
          <div className="flex-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <div className="flex-1 flex items-center gap-0.5">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex-1 bg-blue-400 rounded-full animate-pulse" style={{ height: `${6 + Math.sin(i * 0.7 + Date.now() / 300) * 5}px`, animationDelay: `${i * 50}ms` }} />
              ))}
            </div>
            <span className="text-sm font-mono text-red-500 font-bold">{String(Math.floor(recordSecs / 60)).padStart(2, "0")}:{String(recordSecs % 60).padStart(2, "0")}</span>
          </div>
          <motion.button whileTap={{ scale: 0.92 }} onClick={stopRecording}
            className="p-2.5 rounded-full bg-blue-600 text-white shadow-md"><Send className="w-4 h-4" /></motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => { setShowAttach(a => !a); setShowEmoji(false); }}
            className={`p-2.5 rounded-full transition-colors ${showAttach ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
            <Paperclip className="w-4.5 h-4.5" />
          </motion.button>

          <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded-2xl px-3 py-2">
            <input
              value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && text.trim()) { onSend(text.trim()); setText(""); } }}
              placeholder="Message..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { setShowEmoji(e => !e); setShowAttach(false); }}
              className={`p-1 rounded-full transition-colors ${showEmoji ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
              <Smile className="w-4.5 h-4.5" />
            </motion.button>
          </div>

          {text.trim() ? (
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => { onSend(text.trim()); setText(""); }}
              className="p-2.5 rounded-full bg-blue-600 text-white shadow-md">
              <Send className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.88 }} onPointerDown={startRecording}
              className="p-2.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <Mic className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      )}

      {/* Inline emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-2">
            <div className="grid grid-cols-10 gap-1 max-h-36 overflow-y-auto">
              {ALL_EMOJIS.map((em, i) => (
                <button key={i} onClick={() => setText(t => t + em)}
                  className="text-xl h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                  {em}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Messages List Screen ─────────────────────────────────────────────────────

function MessagesListView({ chats, onOpenChat, onCreateGroup }: { chats: IChat[]; onOpenChat: (id: string) => void; onCreateGroup: () => void }) {
  const [search, setSearch] = useState("");
  const filtered = chats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-3 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <motion.button whileTap={{ scale: 0.88 }} onClick={onCreateGroup}
            className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-sm hover:bg-blue-700 transition-colors">
            <Edit2 className="w-4.5 h-4.5" />
          </motion.button>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="bg-transparent text-sm flex-1 outline-none text-gray-800 placeholder-gray-400" />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-3 pt-2 pb-20">
          {filtered.map((chat, i) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onOpenChat(chat.id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl mb-1 bg-white hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
            >
              <div className="relative shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                {chat.type === "group" && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                    <Users className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                {chat.type === "dm" && chat.streak > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1 py-0.5 border border-orange-100 shadow-sm">
                    <span className="text-[9px] font-bold text-orange-500">🔥{chat.streak}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`font-semibold text-sm truncate ${chat.unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}>{chat.name}</span>
                    <VerifiedBadge type={chat.verified ?? null} />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {chat.streak > 0 && chat.type === "group" && (
                      <span className="text-[9px] font-bold text-orange-500">🔥{chat.streak}</span>
                    )}
                    <span className="text-[10px] text-gray-400">{chat.lastTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate flex-1 ${chat.unreadCount > 0 ? "text-gray-800 font-medium" : "text-gray-400"}`}>{chat.lastMessage}</p>
                  {chat.unreadCount > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}
                      className="ml-2 min-w-[20px] h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 px-1.5">
                      <span className="text-[10px] font-bold text-white">{chat.unreadCount}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pinned Messages Banner ───────────────────────────────────────────────────

function PinnedBanner({ pinned, allMsgs, onNavigate }: { pinned: string[]; allMsgs: IMessage[]; onNavigate: () => void }) {
  const pinnedMsgs = allMsgs.filter(m => pinned.includes(m.id));
  if (pinnedMsgs.length === 0) return null;
  const first = pinnedMsgs[pinnedMsgs.length - 1];

  return (
    <motion.button initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
      onClick={onNavigate}
      className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100 w-full text-left hover:bg-amber-100 transition-colors">
      <Pin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Pinned · {pinnedMsgs.length} message{pinnedMsgs.length > 1 ? "s" : ""}</p>
        <p className="text-xs text-gray-700 truncate">{first.type === "text" ? first.content : `📎 ${first.type}`}</p>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
    </motion.button>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

interface ChatViewProps {
  chat: IChat;
  messages: IMessage[];
  users: IUser[];
  onBack: () => void;
  onViewProfile: (userId: string) => void;
  onOpenGroupInfo: () => void;
  onUpdateMessages: (msgs: IMessage[]) => void;
  onUpdateChat: (chat: IChat) => void;
  onSyncMessage?: (chatId: string, msg: IMessage) => void;
  allChats: IChat[];
}

function ChatView({ chat, messages, users, onBack, onViewProfile, onOpenGroupInfo, onUpdateMessages, onUpdateChat, onSyncMessage, allChats }: ChatViewProps) {
  const [contextMsg, setContextMsg] = useState<IMessage | null>(null);
  const [replyTo, setReplyTo] = useState<IMessage | null>(null);
  const [showForward, setShowForward] = useState(false);
  const [forwardMsgId, setForwardMsgId] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => messages.filter(m => m.pinned).map(m => m.id));
  const [showPinnedList, setShowPinnedList] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const getUser = useCallback((id: string) => users.find(u => u.id === id), [users]);

  const getChatUser = () => {
    if (chat.type === "dm" && chat.userId) return getUser(chat.userId);
    return null;
  };

  const chatUser = getChatUser();

  const addMessage = (msg: IMessage) => {
    onUpdateMessages([...messages, msg]);
    onUpdateChat({ ...chat, lastMessage: msg.type === "text" ? msg.content : `📎 ${msg.type}`, lastTime: "now", unreadCount: 0 });
    if (onSyncMessage) onSyncMessage(chat.id, msg);
  };

  const handleSendText = (text: string) => {
    addMessage(mkMsg(genId(), ME, "text", text, "now", { replyToId: replyTo?.id }));
    setReplyTo(null);
  };

  const handleReact = (emoji: string) => {
    if (!contextMsg) return;
    onUpdateMessages(messages.map(m => {
      if (m.id !== contextMsg.id) return m;
      const existing = m.reactions.find(r => r.emoji === emoji);
      if (existing) {
        const already = existing.users.includes(ME);
        return {
          ...m, reactions: m.reactions.map(r => r.emoji === emoji
            ? { ...r, users: already ? r.users.filter(u => u !== ME) : [...r.users, ME] }
            : r
          ).filter(r => r.users.length > 0)
        };
      }
      return { ...m, reactions: [...m.reactions, { emoji, users: [ME] }] };
    }));
  };

  const handleDelete = () => {
    if (!contextMsg) return;
    onUpdateMessages(messages.filter(m => m.id !== contextMsg.id));
  };

  const handlePin = () => {
    if (!contextMsg) return;
    const isCurrentlyPinned = pinnedIds.includes(contextMsg.id);
    if (!isCurrentlyPinned && pinnedIds.length >= 3) return;
    const newPinned = isCurrentlyPinned ? pinnedIds.filter(id => id !== contextMsg.id) : [...pinnedIds, contextMsg.id];
    setPinnedIds(newPinned);
    onUpdateMessages(messages.map(m => m.id === contextMsg.id ? { ...m, pinned: !isCurrentlyPinned } : m));
  };

  const handleCopy = () => {
    if (contextMsg?.type === "text") navigator.clipboard?.writeText(contextMsg.content).catch(() => {});
  };

  const handleForward = (targetChatId: string) => {
    if (!forwardMsgId) return;
    const msg = messages.find(m => m.id === forwardMsgId);
    if (msg) {
      const forwarded = mkMsg(genId(), ME, msg.type, msg.content, "now", {
        fileName: msg.fileName, fileSize: msg.fileSize,
        contactName: msg.contactName, contactPhone: msg.contactPhone,
        pollQuestion: msg.pollQuestion, pollOptions: msg.pollOptions,
        gifUrl: msg.gifUrl, voiceDuration: msg.voiceDuration
      });
      // In a real app, this would add to the target chat's messages
      console.log("Forwarded to", targetChatId, forwarded);
    }
  };

  const handleVotePoll = (msgId: string, optIdx: number) => {
    onUpdateMessages(messages.map(m => {
      if (m.id !== msgId || !m.pollOptions) return m;
      const alreadyVoted = m.pollOptions.some(o => o.voters.includes(ME));
      if (alreadyVoted) return m;
      return {
        ...m, pollOptions: m.pollOptions.map((opt, i) => i === optIdx
          ? { ...opt, votes: opt.votes + 1, voters: [...opt.voters, ME] } : opt)
      };
    }));
  };

  const senderName = (senderId: string) => {
    if (senderId === ME) return "You";
    return getUser(senderId)?.name || "Unknown";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3">
          <motion.button whileTap={{ scale: 0.88 }} onClick={onBack}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </motion.button>

          <button
            onClick={() => chat.type === "dm" && chat.userId ? onViewProfile(chat.userId) : onOpenGroupInfo()}
            className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="relative shrink-0">
              <img src={chat.avatar} alt={chat.name} className="w-9 h-9 rounded-full object-cover" />
              {chatUser?.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-bold text-sm text-gray-900 truncate">{chat.name}</p>
                <VerifiedBadge type={chat.verified ?? null} />
              </div>
              <p className="text-[10px] text-gray-400">
                {chat.type === "group"
                  ? `${chat.members?.length} members`
                  : chatUser?.online ? "Online" : chatUser?.lastSeen}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {chat.type === "dm" && (
              <>
                <motion.button whileTap={{ scale: 0.88 }} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                  <Phone className="w-4.5 h-4.5" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                  <Video className="w-4.5 h-4.5" />
                </motion.button>
              </>
            )}
            <motion.button whileTap={{ scale: 0.88 }} onClick={onOpenGroupInfo}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
              <Info className="w-4.5 h-4.5" />
            </motion.button>
          </div>
        </div>

        <PinnedBanner pinned={pinnedIds} allMsgs={messages} onNavigate={() => setShowPinnedList(true)} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Pinned messages list modal */}
        <AnimatePresence>
          {showPinnedList && (
            <motion.div className="fixed inset-0 z-40 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPinnedList(false)}>
              <div className="absolute inset-0 bg-black/40" />
              <motion.div className="relative bg-white rounded-t-3xl max-h-[60vh] flex flex-col"
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Pinned Messages</h3>
                  <button onClick={() => setShowPinnedList(false)} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4" /></button>
                </div>
                <div className="overflow-y-auto px-4 pb-6 pt-2 flex flex-col gap-3">
                  {messages.filter(m => pinnedIds.includes(m.id)).map(m => (
                    <div key={m.id} className="flex items-start gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                      <Pin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-0.5">{senderName(m.senderId)}</p>
                        <p className="text-sm text-gray-800">{m.type === "text" ? m.content : `📎 ${m.type}`}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{m.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => {
          const isMine = msg.senderId === ME;
          const sender = msg.senderId !== ME ? getUser(msg.senderId) : undefined;
          const replyToMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : undefined;

          // Date separator
          const showDate = i === 0 || messages[i - 1].timestamp !== msg.timestamp;

          return (
            <div key={msg.id}>
              {showDate && i > 0 && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[10px] text-gray-400 font-medium px-2">{msg.timestamp}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}
              <MessageBubble
                msg={msg}
                isMine={isMine}
                senderAvatar={sender?.avatar}
                senderName={sender?.name}
                replyToMsg={replyToMsg}
                onLongPress={setContextMsg}
                onReply={setReplyTo}
                isGroup={chat.type === "group"}
                onVotePoll={handleVotePoll}
              />
            </div>
          );
        })}

        <div className="h-4" />
      </div>

      {/* Input */}
      <ChatInputBar
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        onSend={handleSendText}
        onSendVoice={() => addMessage(mkMsg(genId(), ME, "voice", "", "now", { voiceDuration: Math.floor(Math.random() * 30) + 5 }))}
        onSendGif={() => setShowGif(true)}
        onSendPoll={() => setShowPoll(true)}
        onSendContact={() => setShowContact(true)}
        onOpenCamera={() => addMessage(mkMsg(genId(), ME, "image", "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=300&h=200&fit=crop", "now"))}
        onSendFile={() => addMessage(mkMsg(genId(), ME, "file", "", "now", { fileName: "document.pdf", fileSize: "2.4 MB" }))}
        replyToSenderName={replyTo ? senderName(replyTo.senderId) : undefined}
      />

      {/* Modals */}
      <AnimatePresence>
        {contextMsg && (
          <ContextMenuOverlay
            msg={contextMsg}
            isMine={contextMsg.senderId === ME}
            isPinned={pinnedIds.includes(contextMsg.id)}
            pinnedCount={pinnedIds.length}
            senderName={senderName(contextMsg.senderId)}
            onClose={() => setContextMsg(null)}
            onReact={handleReact}
            onReply={() => { setReplyTo(contextMsg); setContextMsg(null); }}
            onForward={() => { setForwardMsgId(contextMsg.id); setShowForward(true); setContextMsg(null); }}
            onCopy={handleCopy}
            onPin={handlePin}
            onDelete={handleDelete}
            onReport={() => { alert("Message reported"); }}
          />
        )}
        {showForward && (
          <ForwardModal chats={allChats} onForward={handleForward} onClose={() => setShowForward(false)} />
        )}
        {showGif && (
          <GifPicker onSelect={url => addMessage(mkMsg(genId(), ME, "gif", url, "now", { gifUrl: url }))} onClose={() => setShowGif(false)} />
        )}
        {showPoll && (
          <PollCreator
            onSend={(question, opts) => addMessage(mkMsg(genId(), ME, "poll", "", "now", {
              pollQuestion: question,
              pollOptions: opts.map(t => ({ text: t, votes: 0, voters: [] }))
            }))}
            onClose={() => setShowPoll(false)}
          />
        )}
        {showContact && (
          <ContactPicker users={users} onSelect={u => addMessage(mkMsg(genId(), ME, "contact", "", "now", { contactName: u.name, contactPhone: `@${u.username}` }))} onClose={() => setShowContact(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Group Info Screen ────────────────────────────────────────────────────────

interface GroupInfoProps {
  chat: IChat;
  users: IUser[];
  onBack: () => void;
  onViewProfile: (userId: string) => void;
  onUpdateChat: (chat: IChat) => void;
  onDeleteGroup: () => Promise<void> | void;
  allUsers: IUser[];
}

function GroupInfoScreen({ chat, users, onBack, onViewProfile, onUpdateChat, onDeleteGroup, allUsers }: GroupInfoProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const members = chat.members || [];
  const myRole = members.find(m => m.userId === ME)?.role;
  const isOwner = myRole === "owner";
  const isAdmin = myRole === "admin" || isOwner;
  const owner = members.find(m => m.role === "owner");

  const getUser = (id: string) => {
    if (id === ME) return { id: ME, name: "Marcus Johnson (You)", avatar: "https://i.pravatar.cc/96?img=33", verified: null as VerifiedType, online: true, username: "marcus_j", lastSeen: "now", bio: "", followers: 0, following: 0 };
    return users.find(u => u.id === id);
  };

  const updateRole = (userId: string, role: MemberRole) => {
    onUpdateChat({ ...chat, members: members.map(m => m.userId === userId ? { ...m, role } : m) });
  };

  const removeMember = (userId: string) => {
    onUpdateChat({ ...chat, members: members.filter(m => m.userId !== userId) });
  };

  const addMember = (userId: string) => {
    if (members.find(m => m.userId === userId)) return;
    onUpdateChat({ ...chat, members: [...members, { userId, role: "member" }] });
  };

  const nonMembers = allUsers.filter(u => !members.find(m => m.userId === u.id));

  const roleIcon = (role: MemberRole) => {
    if (role === "owner") return <Crown className="w-3.5 h-3.5 text-amber-500" />;
    if (role === "admin") return <Shield className="w-3.5 h-3.5 text-blue-500" />;
    return null;
  };

  const canDelete = isOwner && members.length <= 1;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <motion.button whileTap={{ scale: 0.88 }} onClick={onBack} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </motion.button>
        <h2 className="font-bold text-gray-900 flex-1">Group Info</h2>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6">
        {/* Group header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white m-4 rounded-3xl p-5 flex flex-col items-center border border-gray-100 shadow-sm">
          <img src={chat.avatar} alt={chat.name} className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow-md" />
          <h2 className="font-bold text-xl text-gray-900 mb-1">{chat.name}</h2>
          {chat.description && <p className="text-sm text-gray-500 text-center">{chat.description}</p>}
          <p className="text-xs text-gray-400 mt-1">{members.length} members · 🔥{chat.streak} day streak</p>
        </motion.div>

        {/* Members */}
        <div className="mx-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wide">Members ({members.length})</h3>
            {isAdmin && (
              <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                <UserPlus className="w-3.5 h-3.5" /> Add
              </motion.button>
            )}
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {members.map((member, i) => {
              const user = getUser(member.userId);
              if (!user) return null;
              const isMe = member.userId === ME;
              const canManage = isAdmin && !isMe && member.role !== "owner";

              return (
                <motion.div key={member.userId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <button onClick={() => !isMe && onViewProfile(member.userId)} className="shrink-0">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                      {roleIcon(member.role)}
                      {"verified" in user && user.verified && <VerifiedBadge type={user.verified} />}
                    </div>
                    <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      {member.role === "member" && (
                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => updateRole(member.userId, "admin")}
                          className="p-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors">
                          <Shield className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                      {member.role === "admin" && (
                        <motion.button whileTap={{ scale: 0.88 }} onClick={() => updateRole(member.userId, "member")}
                          className="p-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                          <Shield className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                      <motion.button whileTap={{ scale: 0.88 }} onClick={() => removeMember(member.userId)}
                        className="p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="mx-4 mb-4 flex flex-col gap-2">
            {members.filter(m => m.userId !== ME).length > 0 && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowTransfer(true)}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Crown className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-gray-900">Transfer Ownership</p>
                  <p className="text-xs text-gray-400">Pass owner rights to a member</p>
                </div>
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => canDelete ? setShowConfirmDelete(true) : alert("You can only delete the group when you're the last member")}
              className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm transition-colors ${canDelete ? "bg-red-50 border-red-100 hover:bg-red-100" : "bg-gray-50 border-gray-100 opacity-50"}`}>
              <div className="w-9 h-9 bg-red-100 rounded-2xl flex items-center justify-center">
                <Trash2 className="w-4.5 h-4.5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm text-red-600">Delete Group</p>
                <p className="text-xs text-gray-400">{canDelete ? "Permanently delete this group" : "Remove all members first"}</p>
              </div>
            </motion.button>
          </div>
        )}

        {!isOwner && (
          <div className="mx-4 mb-4">
            <motion.button whileTap={{ scale: 0.97 }}
              onClick={() => { removeMember(ME); onBack(); }}
              className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors w-full">
              <div className="w-9 h-9 bg-red-100 rounded-2xl flex items-center justify-center">
                <X className="w-4.5 h-4.5 text-red-500" />
              </div>
              <p className="font-semibold text-sm text-red-600">Leave Group</p>
            </motion.button>
          </div>
        )}
      </div>

      {/* Add member sheet */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMember(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div className="relative bg-white rounded-t-3xl max-h-[65vh] flex flex-col shadow-2xl"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Add Members</h3>
                <button onClick={() => setShowAddMember(false)} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto flex-1 px-4 pb-6 pt-2">
                {nonMembers.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">All users are already members</p>
                ) : nonMembers.map(user => (
                  <button key={user.id} onClick={() => { addMember(user.id); setShowAddMember(false); }}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 w-full transition-colors mb-1">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {showTransfer && (
          <motion.div className="fixed inset-0 z-50 flex flex-col justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTransfer(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div className="relative bg-white rounded-t-3xl max-h-[60vh] flex flex-col shadow-2xl"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Transfer Ownership</h3>
                <button onClick={() => setShowTransfer(false)} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto flex-1 px-4 pb-6 pt-2">
                {members.filter(m => m.userId !== ME).map(member => {
                  const user = getUser(member.userId);
                  if (!user) return null;
                  return (
                    <button key={member.userId} onClick={() => {
                      onUpdateChat({ ...chat, members: members.map(m => m.userId === ME ? { ...m, role: "admin" } : m.userId === member.userId ? { ...m, role: "owner" } : m) });
                      setShowTransfer(false);
                    }} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-amber-50 w-full transition-colors mb-1">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                      </div>
                      <Crown className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
        {showConfirmDelete && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmDelete(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div className="relative bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 text-center mb-2">Delete Group?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone. The group and all its messages will be permanently deleted.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmDelete(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => { onDeleteGroup(); }} className="flex-1 py-3 bg-red-500 rounded-2xl font-semibold text-white hover:bg-red-600 transition-colors">Delete</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Group Screen ──────────────────────────────────────────────────────

function CreateGroupScreen({ users, onBack, onCreate }: { users: IUser[]; onBack: () => void; onCreate: (name: string, description: string, members: string[]) => Promise<void> | void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <motion.button whileTap={{ scale: 0.88 }} onClick={onBack} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </motion.button>
        <h2 className="font-bold text-gray-900 flex-1">New Group</h2>
        <motion.button whileTap={{ scale: 0.88 }}
          disabled={!name.trim() || selected.length === 0}
          onClick={() => onCreate(name.trim(), desc.trim(), selected)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl disabled:opacity-40 hover:bg-blue-700 transition-colors">
          Create
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4">
          {/* Group name */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex-1">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Group name" className="w-full text-base font-semibold text-gray-900 outline-none border-b border-gray-200 pb-1 mb-2 placeholder-gray-400 bg-transparent" />
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Group description (optional)" className="w-full text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent" />
              </div>
            </div>
          </div>

          {/* Selected members preview */}
          {selected.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {selected.map(id => {
                const user = users.find(u => u.id === id);
                if (!user) return null;
                return (
                  <motion.button key={id} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    onClick={() => toggle(id)} className="flex flex-col items-center gap-1 shrink-0">
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                        <X className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 font-medium max-w-[48px] truncate">{user.name.split(" ")[0]}</p>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* User list */}
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Add Members</h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {users.map((user, i) => (
              <motion.button key={user.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }} onClick={() => toggle(user.id)}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left transition-colors ${i < users.length - 1 ? "border-b border-gray-50" : ""} ${selected.includes(user.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                <div className="relative shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover" />
                  {user.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                    <VerifiedBadge type={user.verified} />
                  </div>
                  <p className="text-xs text-gray-400">@{user.username}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected.includes(user.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                  {selected.includes(user.id) && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User Profile View ────────────────────────────────────────────────────────

function UserProfileView({ user, isFollowing, onToggleFollow, onBack, onMessage }: {
  user: IUser; isFollowing: boolean; onToggleFollow: () => void; onBack: () => void; onMessage: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  const posts = Array.from({ length: 9 }, (_, i) => `https://images.unsplash.com/photo-${["1516912481808-3406841bd33c", "1541961017774-22349e4a1262", "1574158622682-e40e69881006", "1543852786-1cf6624b9987", "1545389336-cf090694435e", "1549049950-48d5887197a0", "1516912481808-3406841bd33c", "1587300003388-59208cc962cb", "1606216794074-735e91aa2c92"][i]}?w=200&h=200&fit=crop`);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center px-4 py-3 border-b border-gray-100 shrink-0">
        <motion.button whileTap={{ scale: 0.88 }} onClick={onBack} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </motion.button>
        <h2 className="flex-1 text-center font-bold text-gray-900">Profile</h2>
        <div className="w-9 h-9" />
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header */}
        <div className="relative h-36 bg-gradient-to-br from-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
          {/* Avatar */}
          <div className="absolute -bottom-12 left-5">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}>
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                {user.online && (
                  <span className="absolute bottom-1 right-1 flex w-4 h-4">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                    <span className="relative w-4 h-4 bg-green-500 border-2 border-white rounded-full inline-flex" />
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="px-5 mt-16 mb-6">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 15 }} transition={{ delay: 0.2 }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                  <VerifiedBadge type={user.verified} />
                </div>
                <p className="text-gray-400 text-sm">@{user.username}</p>
                {user.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-xs">{user.bio}</p>}
                {!user.online && (
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full inline-block" />
                    Last seen {user.lastSeen}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 mb-5">
              {[{ label: "Followers", value: user.followers.toLocaleString() }, { label: "Following", value: user.following.toLocaleString() }].map(stat => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="font-bold text-lg text-gray-900">{stat.value}</span>
                  <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.96 }} onClick={onToggleFollow}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${isFollowing ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"}`}>
                {isFollowing ? "Following" : "Follow"}
              </motion.button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={onMessage}
                className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                <ChevronRight className="w-4 h-4" /> Message
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Posts grid */}
        <div className="border-t border-gray-100">
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((url, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 + i * 0.04 }}
                className="aspect-square bg-gray-100 overflow-hidden">
                <img src={url} alt={`post ${i}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main MessagesScreen ──────────────────────────────────────────────────────

export function MessagesScreen() {
  const { user } = useAuth();
  const [stack, setStack] = useState<ScreenView[]>([{ view: "list" }]);
  const [chats, setChats] = useState<IChat[]>([]);
  const [messages, setMessages] = useState<Record<string, IMessage[]>>({});
  const users = INITIAL_USERS;
  const [followingIds, setFollowingIds] = useState<string[]>(["u1", "u4"]);
  const prevLen = useRef(1);
  const [direction, setDirection] = useState(1);
  const authUserId = user?.id;

  useEffect(() => {
    if (!authUserId) return;

    const loadMessages = async () => {
      const { data: chatData, error: chatError } = await supabase.from("chats").select("*").order("updated_at", { ascending: false }).limit(30);
      const { data: msgData, error: msgError } = await supabase.from("messages").select("*");

      if (!chatError && Array.isArray(chatData) && chatData.length > 0) {
        setChats(chatData.map((row: any) => ({
          id: row.id,
          type: row.type,
          name: row.name,
          avatar: row.avatar,
          verified: row.verified,
          streak: row.streak,
          unreadCount: row.unread_count,
          lastMessage: row.last_message,
          lastTime: row.last_time,
          userId: row.user_id,
          members: row.members,
          description: row.description,
        })));
      } else if (chatError || !Array.isArray(chatData) || chatData.length === 0) {
        setChats(INITIAL_CHATS);
      }

      if (!msgError && Array.isArray(msgData) && msgData.length > 0 && msgData.length > 0) {
        const grouped = msgData.reduce((acc: Record<string, IMessage[]>, row: any) => {
          const chatId = row.chat_id;
          const senderId = row.sender_id === authUserId ? ME : row.sender_id;
          const msg: IMessage = {
            id: row.id,
            senderId,
            type: row.type,
            content: row.content,
            timestamp: row.timestamp,
            reactions: row.reactions ?? [],
            pinned: row.pinned ?? false,
            replyToId: row.reply_to_id ?? undefined,
            voiceDuration: row.voice_duration ?? undefined,
            pollQuestion: row.poll_question ?? undefined,
            pollOptions: row.poll_options ?? undefined,
            fileName: row.file_name ?? undefined,
            fileSize: row.file_size ?? undefined,
            contactName: row.contact_name ?? undefined,
            contactPhone: row.contact_phone ?? undefined,
            gifUrl: row.gif_url ?? undefined,
          };
          acc[chatId] = acc[chatId] ? [...acc[chatId], msg] : [msg];
          return acc;
        }, {});
        setMessages((prev) => ({ ...prev, ...grouped }));
      }
    };

    loadMessages().catch((error) => console.error("Failed to load chat data from Supabase:", error));
  }, [authUserId]);

  const syncMessageToSupabase = async (chatId: string, msg: IMessage) => {
    if (!authUserId) return;

    const { error } = await supabase.from("messages").upsert({
      id: msg.id,
      chat_id: chatId,
      sender_id: authUserId,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      reply_to_id: msg.replyToId,
      pinned: msg.pinned,
      reactions: msg.reactions,
    });

    if (error) {
      console.error("Failed to sync message to Supabase:", error.message);
    }
  };

  const syncChatToSupabase = async (chat: IChat) => {
    if (!authUserId) return;

    const { error } = await supabase.from("chats").upsert({
      id: chat.id,
      type: chat.type,
      name: chat.name,
      avatar: chat.avatar,
      verified: chat.verified,
      streak: chat.streak,
      unread_count: chat.unreadCount,
      last_message: chat.lastMessage,
      last_time: chat.lastTime,
      user_id: chat.userId,
      members: chat.members,
      description: chat.description,
    });

    if (error) {
      console.error("Failed to sync chat to Supabase:", error.message);
    }
  };

  const push = useCallback((s: ScreenView) => {
    setDirection(1);
    setStack(p => [...p, s]);
  }, []);

  const pop = useCallback(() => {
    setDirection(-1);
    setStack(p => p.length > 1 ? p.slice(0, -1) : p);
  }, []);

  const current = stack[stack.length - 1];

  useEffect(() => {
    const shouldHide = current.view === "chat" || current.view === "profile";
    document.documentElement.classList.toggle("hide-bottom-nav", shouldHide);
    return () => document.documentElement.classList.remove("hide-bottom-nav");
  }, [current.view]);

  useEffect(() => {
    if (stack.length !== prevLen.current) prevLen.current = stack.length;
  }, [stack.length]);

  const updateMessages = (chatId: string, msgs: IMessage[]) => {
    setMessages(p => ({ ...p, [chatId]: msgs }));
  };

  const updateChat = (updated: IChat) => {
    setChats(p => p.map(c => c.id === updated.id ? updated : c));
  };

  const createGroup = async (name: string, description: string, memberIds: string[]) => {
    const id = `g${Date.now()}`;
    const newGroup: IChat = {
      id,
      type: "group",
      name,
      description,
      avatar: `https://i.pravatar.cc/96?img=${Math.floor(Math.random() * 70 + 53)}`,
      streak: 0,
      unreadCount: 0,
      lastMessage: "Group created",
      lastTime: "now",
      members: [{ userId: ME, role: "owner" }, ...memberIds.map(uid => ({ userId: uid, role: "member" as MemberRole }))],
    };

    const firstMessage = mkMsg(genId(), ME, "text", `${name} group created! 🎉`, "now");

    setChats((p) => [newGroup, ...p]);
    setMessages((p) => ({ ...p, [id]: [firstMessage] }));
    pop();
    push({ view: "chat", chatId: id });

    syncChatToSupabase(newGroup).catch(console.error);
    syncMessageToSupabase(id, firstMessage).catch(console.error);
  };

  const deleteGroup = async (chatId: string) => {
    setChats((p) => p.filter((c) => c.id !== chatId));
    setMessages((p) => {
      const next = { ...p };
      delete next[chatId];
      return next;
    });
    pop();
    pop();

    const { error: deleteMessagesError } = await supabase.from("messages").delete().eq("chat_id", chatId);
    if (deleteMessagesError) {
      console.error("Failed to delete group messages from Supabase:", deleteMessagesError.message);
    }

    const { error: deleteChatError } = await supabase.from("chats").delete().eq("id", chatId);
    if (deleteChatError) {
      console.error("Failed to delete group chat from Supabase:", deleteChatError.message);
    }
  };

  const renderScreen = () => {
    const v = current;

    if (v.view === "list") {
      return (
        <MessagesListView
          chats={chats}
          onOpenChat={id => push({ view: "chat", chatId: id })}
          onCreateGroup={() => push({ view: "create-group" })}
        />
      );
    }

    if (v.view === "chat") {
      const chat = chats.find(c => c.id === v.chatId);
      if (!chat) return null;
      return (
        <ChatView
          chat={chat}
          messages={messages[v.chatId] || []}
          users={users}
          onBack={pop}
          onViewProfile={userId => push({ view: "profile", userId })}
          onOpenGroupInfo={() => push({ view: "group-info", chatId: v.chatId })}
          onUpdateMessages={msgs => updateMessages(v.chatId, msgs)}
          onUpdateChat={updated => {
            updateChat(updated);
            syncChatToSupabase(updated).catch(console.error);
          }}
          onSyncMessage={syncMessageToSupabase}
          allChats={chats}
        />
      );
    }

    if (v.view === "group-info") {
      const chat = chats.find(c => c.id === v.chatId);
      if (!chat) return null;
      return (
        <GroupInfoScreen
          chat={chat}
          users={users}
          allUsers={users}
          onBack={pop}
          onViewProfile={userId => push({ view: "profile", userId })}
          onUpdateChat={(updated) => {
            updateChat(updated);
            syncChatToSupabase(updated).catch(console.error);
          }}
          onDeleteGroup={() => deleteGroup(v.chatId)}
        />
      );
    }

    if (v.view === "create-group") {
      return (
        <CreateGroupScreen
          users={users}
          onBack={pop}
          onCreate={createGroup}
        />
      );
    }

    if (v.view === "profile") {
      const user = users.find(u => u.id === v.userId);
      if (!user) return null;
      const existing = chats.find(c => c.type === "dm" && c.userId === v.userId);
      return (
        <UserProfile
          user={user}
          isFollowing={followingIds.includes(v.userId)}
          onToggleFollow={() => setFollowingIds(p => p.includes(v.userId) ? p.filter(id => id !== v.userId) : [...p, v.userId])}
          onBack={pop}
          onMessage={() => {
            if (existing) {
              pop();
              push({ view: "chat", chatId: existing.id });
            } else {
              pop();
            }
          }}
        />
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 relative overflow-hidden font-[Plus_Jakarta_Sans,system-ui,sans-serif]">
      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        .animate-ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
      `}</style>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={stack.map(s => s.view + (s as any).chatId + (s as any).userId).join("-")}
          initial={{ x: direction > 0 ? "100%" : "-30%", opacity: direction < 0 ? 0.6 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? "-30%" : "100%", opacity: direction > 0 ? 0.6 : 1 }}
          transition={{ type: "spring", damping: 28, stiffness: 250 }}
          className="absolute inset-0"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-[430px] h-[880px] max-h-screen bg-white rounded-[48px] overflow-hidden shadow-2xl border border-gray-200 relative" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
        <MessagesScreen />
      </div>
    </div>
  );
}