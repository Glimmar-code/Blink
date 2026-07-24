import { View, Text } from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, MoreVertical, MessageCircle, Heart, Share, Bookmark, Repeat2, Eye, Send,
  PenSquare, Megaphone, X, Trash2, Image as ImageIcon, Trophy, Bell, MapPin,
  AtSign, Link2, Tag, ChevronLeft, ChevronRight, Video, ShoppingBag, Gamepad2,
  GraduationCap, Calendar, Home, Pause, Play,
} from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BottomNav } from "./BottomNav";
import { usePostsCtx } from "../PostsContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Story {
  id: number;
  type?: "add";
  mediaType?: "image" | "video" | "text";
  mediaUrl?: string;
  text?: string;
  bgColor?: string;
  tags?: string[];
  location?: string;
  mention?: string;
  link?: string;
  name?: string;
  username?: string;
  hasUnseen?: boolean;
  views?: number;
  likes?: number;
  likedByMe?: boolean;
  timestamp?: string;
  isMyStory?: boolean;
}

interface FeedPost {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  image?: string;
  views: number;
  likes: number;
  comments: number;
  created_at: string;
}

interface CommentType {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByMe: boolean;
  replies: CommentType[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_STORIES: Story[] = [
  { id: 1, type: "add" },
  { id: 2, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", name: "Sarah", username: "sarah_m", hasUnseen: true, views: 124, likes: 45, likedByMe: false, timestamp: "2h ago" },
  { id: 3, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", name: "Mike", username: "mike_b", hasUnseen: true, views: 89, likes: 32, likedByMe: false, timestamp: "5h ago" },
  { id: 4, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1708098746991-ad0a97313727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", name: "Jessica", username: "jess_smith", hasUnseen: false, views: 203, likes: 78, likedByMe: true, timestamp: "1d ago" },
  { id: 5, mediaType: "image", mediaUrl: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", name: "David", username: "david_k", hasUnseen: false, views: 156, likes: 61, likedByMe: false, timestamp: "1d ago" },
];

const SPONSORED_POSTS = [
  {
    id: "sp1",
    brandName: "CampusEats",
    brandAvatar: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    brandHandle: "@campuseats",
    content: "🍔 Hot meals delivered to your hostel in 15 minutes! Use code CAMPUS20 for 20% off your first order. Order now and fuel your study sessions! 🚀",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    cta: "Order Now",
    views: 18500,
    likes: 2340,
    comments: 412,
  },
  {
    id: "sp2",
    brandName: "TechBridge Academy",
    brandAvatar: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=100",
    brandHandle: "@techbridge",
    content: "💻 Learn to code in 12 weeks. Join 500+ students who landed tech internships through our bootcamp. Scholarships available for students!",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    cta: "Apply Now",
    views: 31200,
    likes: 4100,
    comments: 879,
  },
];

const SAMPLE_COMMENTS: CommentType[] = [
  {
    id: "c1",
    authorName: "Aisha Bello",
    authorUsername: "aisha_b",
    authorAvatar: "https://i.pravatar.cc/40?img=1",
    text: "This is absolutely amazing! 🔥 Campus life never gets old",
    timestamp: "2h",
    likes: 24,
    likedByMe: false,
    replies: [
      {
        id: "c1r1",
        authorName: "Chidi Okonkwo",
        authorUsername: "chidi_ok",
        authorAvatar: "https://i.pravatar.cc/40?img=3",
        text: "Totally agree with you! 💯",
        timestamp: "1h",
        likes: 8,
        likedByMe: false,
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    authorName: "Fatima Yusuf",
    authorUsername: "fatimay",
    authorAvatar: "https://i.pravatar.cc/40?img=5",
    text: "Which campus is this? Looks like a vibe 😍",
    timestamp: "3h",
    likes: 11,
    likedByMe: true,
    replies: [],
  },
  {
    id: "c3",
    authorName: "Emeka Nwosu",
    authorUsername: "emeka_n",
    authorAvatar: "https://i.pravatar.cc/40?img=7",
    text: "Midterms are DONE let's go! 🎉🎉🎉",
    timestamp: "4h",
    likes: 37,
    likedByMe: false,
    replies: [
      {
        id: "c3r1",
        authorName: "Ngozi Eze",
        authorUsername: "ngozi_e",
        authorAvatar: "https://i.pravatar.cc/40?img=9",
        text: "Finally! Celebration mode 🥳",
        timestamp: "3h",
        likes: 5,
        likedByMe: false,
        replies: [],
      },
      {
        id: "c3r2",
        authorName: "Tunde Adeyemi",
        authorUsername: "tunde_a",
        authorAvatar: "https://i.pravatar.cc/40?img=11",
        text: "Same!! Study group at 6pm?",
        timestamp: "2h",
        likes: 3,
        likedByMe: false,
        replies: [],
      },
    ],
  },
];

// ─── Story Progress Bar ────────────────────────────────────────────────────────

function StoryProgressSegment({
  duration,
  paused,
  completed,
  onComplete,
}: {
  duration: number;
  paused: boolean;
  completed: boolean;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    if (completed) { setProgress(100); return; }
    if (paused) {
      cancelAnimationFrame(rafRef.current);
      elapsedRef.current += Date.now() - startRef.current;
      return;
    }
    startRef.current = Date.now();
    const tick = () => {
      const total = elapsedRef.current + (Date.now() - startRef.current);
      const pct = Math.min((total / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) { rafRef.current = requestAnimationFrame(tick); }
      else { cbRef.current(); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      elapsedRef.current += Date.now() - startRef.current;
    };
  }, [paused, completed, duration]);

  return (
    <View className="h-0.5 bg-white/30 rounded-full flex-1">
      <View className="h-full bg-white rounded-full" style={{ width: `${progress}%` }} />
    </View>
  );
}

// ─── Story Viewer ─────────────────────────────────────────────────────────────

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
}

function StoryViewer({ stories, initialIndex, onClose, onLike, onDelete }: StoryViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const story = stories[index];
  const isVideo = story?.mediaType === "video";
  const duration = isVideo ? 30000 : 5000;

  const goNext = useCallback(() => {
    if (index < stories.length - 1) setIndex((i) => i + 1);
    else onClose();
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Progress bars */}
      <View className="absolute top-3 left-3 right-3 z-20 flex gap-1">
        {stories.map((_, i) => (
          <StoryProgressSegment
            key={`${index}-${i}`}
            duration={duration}
            paused={paused}
            completed={i < index}
            onComplete={i === index ? goNext : () => {}}
          />
        ))}
      </View>

      {/* Header */}
      <View className="absolute top-6 left-0 right-0 z-20 px-4 pt-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pb-6">
        <Link to={`/profile/${story.username}`} className="flex items-center gap-3" onClick={onClose}>
          <img src={story.mediaUrl} alt={story.name} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
          <View>
            <Text className="text-white font-semibold text-sm leading-tight">{story.name}</Text>
            <Text className="text-white/70 text-xs">{story.timestamp}</Text>
          </View>
        </Link>
        <View className="flex items-center gap-2">
          {paused ? <Pause className="w-5 h-5 text-white/80" /> : <Play className="w-5 h-5 text-white/80" />}
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </View>
      </View>

      {/* Media Content */}
      <View className="w-full h-full flex items-center justify-center">
        {story.mediaType === "text" ? (
          <View
            className="w-full h-full flex flex-col items-center justify-center p-8 gap-4"
            style={{ background: story.bgColor || "linear-gradient(135deg, #667eea, #764ba2)" }}
          >
            <Text className="text-white text-2xl font-bold text-center leading-relaxed">{story.text}</Text>
            {story.location && (
              <View className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <Text className="text-white text-xs font-medium">{story.location}</Text>
              </View>
            )}
            {story.tags && story.tags.length > 0 && (
              <View className="flex flex-wrap gap-1.5 justify-center">
                {story.tags.map((t) => (
                  <Text key={t} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">#{t}</Text>
                ))}
              </View>
            )}
          </View>
        ) : story.mediaType === "video" ? (
          <video
            ref={videoRef}
            src={story.mediaUrl}
            className="max-w-full max-h-full object-contain"
            autoPlay
            playsInline
            onEnded={goNext}
          />
        ) : (
          <img src={story.mediaUrl} alt={story.name} className="max-w-full max-h-full object-contain" />
        )}
      </View>

      {/* Overlay extras (tags, location, link) */}
      {(story.location || story.tags?.length || story.link) && story.mediaType !== "text" && (
        <View className="absolute bottom-24 left-4 z-20 flex flex-col gap-2">
          {story.location && (
            <View className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <Text className="text-white text-xs">{story.location}</Text>
            </View>
          )}
          {story.tags?.map((t) => (
            <Text key={t} className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">#{t}</Text>
          ))}
          {story.link && (
            <a href={story.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full" onClick={(e) => e.stopPropagation()}>
              <Link2 className="w-3.5 h-3.5 text-white" />
              <Text className="text-white text-xs truncate max-w-[150px]">{story.link}</Text>
            </a>
          )}
        </View>
      )}

      {/* Footer actions */}
      <View className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onLike(story.id); }}
              className="flex items-center gap-2"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
              <Heart className={`w-6 h-6 ${story.likedByMe ? "fill-red-500 text-red-500" : "text-white"}`} />
              <Text className="text-white font-semibold">{story.likes}</Text>
            </motion.button>
            <View className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-white" />
              <Text className="text-white text-sm font-semibold">{story.views}</Text>
            </View>
          </View>
          {story.isMyStory && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onDelete(story.id); }}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </motion.button>
          )}
        </View>
      </View>

      {/* Tap zones for prev/next */}
      <button
        className="absolute left-0 top-0 w-1/3 h-full z-10 opacity-0"
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
      />
      <button
        className="absolute right-0 top-0 w-1/3 h-full z-10 opacity-0"
        onClick={(e) => { e.stopPropagation(); goNext(); }}
      />
    </motion.div>
  );
}

// ─── Create Story Modal ───────────────────────────────────────────────────────

const BG_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
];

interface CreateStoryModalProps {
  onClose: () => void;
  onPost: (story: Omit<Story, "id" | "isMyStory" | "views" | "timestamp">) => void;
}

function CreateStoryModal({ onClose, onPost }: CreateStoryModalProps) {
  const [mediaType, setMediaType] = useState<"image" | "video" | "text">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState(BG_GRADIENTS[0]);
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [mention, setMention] = useState("");
  const [link, setLink] = useState("");
  const [showExtras, setShowExtras] = useState(false);

  const canPost = mediaType === "text" ? text.trim().length > 0 : mediaUrl.trim().length > 0;

  const handlePost = () => {
    if (!canPost) return;
    onPost({
      mediaType,
      mediaUrl: mediaType !== "text" ? mediaUrl : undefined,
      text: mediaType === "text" ? text : undefined,
      bgColor: mediaType === "text" ? bgColor : undefined,
      tags: tags ? tags.split(/\s+/).map((t) => t.replace(/^#/, "")).filter(Boolean) : [],
      location: location || undefined,
      mention: mention || undefined,
      link: link || undefined,
      name: "Marcus J.",
      username: "marcus_j",
      hasUnseen: true,
      likes: 0,
      likedByMe: false,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <View className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-bold text-gray-900 text-base">Create Status</h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePost}
            disabled={!canPost}
            className="px-5 py-2 bg-blue-600 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-sm rounded-full transition-colors"
          >
            Post
          </motion.button>
        </View>

        <View className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden">
          {/* Type selector */}
          <View className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            {(["image", "video", "text"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMediaType(t)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  mediaType === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {t === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                {t === "video" && <Video className="w-3.5 h-3.5" />}
                {t === "text" && <Tag className="w-3.5 h-3.5" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </View>

          {/* Media input */}
          {mediaType !== "text" ? (
            <View className="flex flex-col gap-3">
              <View className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                {mediaType === "image" ? <ImageIcon className="w-5 h-5 text-gray-400 shrink-0" /> : <Video className="w-5 h-5 text-gray-400 shrink-0" />}
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={`Paste ${mediaType} URL...`}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </View>
              <AnimatePresence>
                {mediaUrl && mediaType === "image" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl overflow-hidden border border-gray-200"
                  >
                    <img src={mediaUrl} alt="Preview" className="w-full h-48 object-cover" />
                  </motion.div>
                )}
              </AnimatePresence>
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              <View className="relative rounded-2xl overflow-hidden" style={{ background: bgColor, minHeight: 180 }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength={200}
                  className="w-full h-44 bg-transparent text-white placeholder-white/60 text-xl font-bold text-center p-6 outline-none resize-none"
                />
                <Text className="absolute bottom-2 right-3 text-white/50 text-xs">{text.length}/200</Text>
              </View>
              {/* Background picker */}
              <View className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {BG_GRADIENTS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setBgColor(g)}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 transition-transform ${bgColor === g ? "border-gray-900 scale-110" : "border-transparent"}`}
                    style={{ background: g }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Extras toggle */}
          <button
            onClick={() => setShowExtras((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <Plus className={`w-4 h-4 transition-transform ${showExtras ? "rotate-45" : ""}`} />
            {showExtras ? "Hide extras" : "Add tags, location, mentions & link"}
          </button>

          <AnimatePresence>
            {showExtras && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3 overflow-hidden"
              >
                {[
                  { icon: Tag, placeholder: "#campus #university ...", value: tags, setter: setTags, label: "Tags" },
                  { icon: MapPin, placeholder: "Add location", value: location, setter: setLocation, label: "Location" },
                  { icon: AtSign, placeholder: "@mention someone", value: mention, setter: setMention, label: "Mention" },
                  { icon: Link2, placeholder: "https://link.com", value: link, setter: setLink, label: "Link" },
                ].map(({ icon: Icon, placeholder, value, setter, label }) => (
                  <View key={label} className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                  </View>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </View>
      </motion.div>
    </motion.div>
  );
}

// ─── Comment Components ───────────────────────────────────────────────────────

interface CommentItemProps {
  comment: CommentType;
  depth?: number;
  onUpdate: (updated: CommentType) => void;
}

function CommentItem({ comment, depth = 0, onUpdate }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const toggleLike = () =>
    onUpdate({
      ...comment,
      likedByMe: !comment.likedByMe,
      likes: comment.likedByMe ? comment.likes - 1 : comment.likes + 1,
    });

  const submitReply = () => {
    if (!replyText.trim()) return;
    const newReply: CommentType = {
      id: `r-${Date.now()}`,
      authorName: "Marcus J.",
      authorUsername: "marcus_j",
      authorAvatar: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=40",
      text: replyText.trim(),
      timestamp: "just now",
      likes: 0,
      likedByMe: false,
      replies: [],
    };
    onUpdate({ ...comment, replies: [...comment.replies, newReply] });
    setReplyText("");
    setReplying(false);
    setShowReplies(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={depth > 0 ? "ml-10 mt-2" : ""}
    >
      <View className="flex gap-3">
        <Link to={`/profile/${comment.authorUsername}`} className="shrink-0">
          <img src={comment.authorAvatar} alt={comment.authorName} className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity" />
        </Link>
        <View className="flex-1 min-w-0">
          <View className="bg-gray-50 rounded-2xl px-4 py-2.5">
            <Link to={`/profile/${comment.authorUsername}`} className="hover:underline">
              <Text className="font-semibold text-sm text-gray-900">{comment.authorName}</Text>
            </Link>
            <Text className="text-sm text-gray-700 mt-0.5 leading-relaxed">{comment.text}</Text>
          </View>
          <View className="flex items-center gap-4 mt-1.5 px-1">
            <Text className="text-xs text-gray-400">{comment.timestamp}</Text>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleLike}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors ${comment.likedByMe ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              <Heart className={`w-3.5 h-3.5 ${comment.likedByMe ? "fill-current" : ""}`} />
              {comment.likes > 0 && <Text>{comment.likes}</Text>}
            </motion.button>
            {depth === 0 && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="text-xs font-semibold text-gray-400 hover:text-blue-500 transition-colors"
              >
                Reply
              </button>
            )}
          </View>

          {/* Reply input */}
          <AnimatePresence>
            {replying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 flex gap-2 overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitReply()}
                  placeholder={`Reply to ${comment.authorName}...`}
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 outline-none focus:border-blue-400 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={submitReply}
                  disabled={!replyText.trim()}
                  className="text-blue-600 disabled:text-gray-300 font-semibold text-sm transition-colors"
                >
                  Post
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show/hide replies */}
          {comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="mt-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              {showReplies ? "▲" : "▼"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {comment.replies.map((reply, i) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onUpdate={(updated) => {
                      const newReplies = [...comment.replies];
                      newReplies[i] = updated;
                      onUpdate({ ...comment, replies: newReplies });
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </View>
      </View>
    </motion.div>
  );
}

interface CommentModalProps {
  onClose: () => void;
  postId: string;
}

function CommentModal({ onClose, postId }: CommentModalProps) {
  const [comments, setComments] = useState<CommentType[]>(SAMPLE_COMMENTS);
  const [newComment, setNewComment] = useState("");

  const submitComment = () => {
    if (!newComment.trim()) return;
    const c: CommentType = {
      id: `c-${Date.now()}`,
      authorName: "Marcus J.",
      authorUsername: "marcus_j",
      authorAvatar: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=40",
      text: newComment.trim(),
      timestamp: "just now",
      likes: 0,
      likedByMe: false,
      replies: [],
    };
    setComments((prev) => [...prev, c]);
    setNewComment("");
  };

  const updateComment = (index: number, updated: CommentType) => {
    setComments((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <View className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900 text-lg">Comments ({comments.length})</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </View>

        <View className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 [&::-webkit-scrollbar]:hidden">
          {comments.map((c, i) => (
            <CommentItem key={c.id} comment={c} onUpdate={(updated) => updateComment(i, updated)} />
          ))}
        </View>

        <View className="px-5 py-4 border-t border-gray-100 shrink-0">
          <View className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=40"
              alt="Me"
              className="w-9 h-9 rounded-full object-cover shrink-0"
            />
            <View className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-blue-400 transition-colors">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={submitComment}
                disabled={!newComment.trim()}
                className="text-blue-600 disabled:text-gray-300 font-semibold text-sm transition-colors shrink-0"
              >
                Post
              </motion.button>
            </View>
          </View>
        </View>
      </motion.div>
    </motion.div>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-900 text-lg text-center">Share Post</h3>
        <View className="grid grid-cols-4 gap-4">
          {[
            { label: "Message", bg: "bg-blue-100", color: "text-blue-600", icon: <Send className="w-5 h-5" /> },
            { label: "WhatsApp", bg: "bg-green-100", color: "text-green-600", icon: <MessageCircle className="w-5 h-5" /> },
            { label: "Copy Link", bg: "bg-gray-100", color: "text-gray-600", icon: <Link2 className="w-5 h-5" /> },
            { label: "More", bg: "bg-purple-100", color: "text-purple-600", icon: <MoreVertical className="w-5 h-5" /> },
          ].map(({ label, bg, color, icon }) => (
            <button key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <View className={`w-12 h-12 rounded-full ${bg} ${color} flex items-center justify-center`}>{icon}</View>
              <Text className="text-xs text-gray-600">{label}</Text>
            </button>
          ))}
        </View>
        <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Sponsored Post Card ──────────────────────────────────────────────────────

function SponsoredPostCard({ post }: { post: typeof SPONSORED_POSTS[0] }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const handleLike = () => {
    setIsLiked((v) => !v);
    setLikeCount((c) => (isLiked ? c - 1 : c + 1));
  };

  return (
    <>
      <View className="bg-card px-4 py-5 border-b border-border flex flex-col gap-3">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <img src={post.brandAvatar} alt={post.brandName} className="w-10 h-10 rounded-full object-cover" />
            <View>
              <View className="flex items-center gap-2">
                <Text className="font-bold text-foreground text-sm">{post.brandName}</Text>
                <Text className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Sponsored</Text>
              </View>
              <Text className="text-muted-foreground text-xs">{post.brandHandle}</Text>
            </View>
          </View>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </View>

        <Text className="text-sm text-foreground/90 leading-relaxed">{post.content}</Text>

        <View className="rounded-2xl overflow-hidden border border-border">
          <img src={post.image} alt="Sponsored" className="w-full h-52 object-cover" />
        </View>

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow text-sm"
        >
          {post.cta}
        </motion.button>

        <View className="flex items-center justify-between text-muted-foreground pt-1">
          <View className="flex items-center gap-5">
            <Text className="flex items-center gap-1.5 text-xs">
              <Eye className="w-4 h-4" />
              {post.views.toLocaleString()}
            </Text>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className={`flex items-center gap-1.5 text-xs transition-colors ${isLiked ? "text-red-500" : "hover:text-red-500"}`}>
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              {likeCount.toLocaleString()}
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCommentModal(true)} className="flex items-center gap-1.5 text-xs hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              {post.comments}
            </motion.button>
          </View>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowShareModal(true)} className="hover:text-foreground transition-colors">
            <Share className="w-4 h-4" />
          </motion.button>
        </View>
      </View>

      <AnimatePresence>
        {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
        {showCommentModal && <CommentModal onClose={() => setShowCommentModal(false)} postId={post.id} />}
      </AnimatePresence>
    </>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

const POST_DATA: FeedPost = {
  id: "post-jess-1",
  authorName: "Jessica Smith",
  authorUsername: "jess_smith",
  authorAvatar: "https://images.unsplash.com/photo-1708098746991-ad0a97313727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  content: "Just wrapped up midterms! 🎉 The campus vibe is amazing today. Anyone down for a study group later? #CampusLife #Midterms",
  image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  views: 4200,
  likes: 1200,
  comments: 148,
  created_at: new Date().toISOString(),
};

export function PostCard({ post, postId = POST_DATA.id }: { post?: FeedPost; postId?: string }) {
  const { likedIds, savedIds, toggleLike, toggleSave } = usePostsCtx();
  const id = post?.id ?? postId;
  const isLiked = likedIds.has(id);
  const isSaved = savedIds.has(id);
  const [isReposted, setIsReposted] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 1200);
  const [repostCount, setRepostCount] = useState(12);
  const currentPost = post ?? POST_DATA;

  const handleLike = () => {
    toggleLike(id);
    setLikeCount((c) => (isLiked ? c - 1 : c + 1));
  };

  const handleRepost = () => {
    setIsReposted((v) => !v);
    setRepostCount((c) => (isReposted ? c - 1 : c + 1));
  };

  return (
    <>
      <View className="bg-card px-4 py-5 border-b border-border flex flex-col gap-3 text-card-foreground">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <Link to={`/profile/${currentPost.authorUsername}`} className="shrink-0">
              <img src={currentPost.authorAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity" />
            </Link>
            <View>
              <View className="flex items-center gap-1">
                <Link to={`/profile/${currentPost.authorUsername}`} className="hover:underline">
                  <Text className="font-bold text-foreground text-sm">{currentPost.authorName}</Text>
                </Link>
                <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </View>
              <Text className="text-muted-foreground text-xs">@{currentPost.authorUsername} • 2h</Text>
            </View>
          </View>
          <View className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.95 }} className="bg-foreground text-background text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
              Follow
            </motion.button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </View>
        </View>

        <Link to={`/post/${currentPost.id}`} className="block cursor-pointer">
            <Text className="text-sm text-foreground/90 leading-relaxed">
              {currentPost.content}
            </Text>
            {currentPost.image ? (
              <View className="mt-3 rounded-2xl overflow-hidden border border-border">
                <img
                  src={currentPost.image}
                  alt="Post image"
                  className="w-full h-56 object-cover"
                />
              </View>
            ) : null}
        </Link>

        <View className="flex items-center justify-between mt-1 text-muted-foreground pt-1">
          <View className="flex items-center gap-5">
            <Text className="flex items-center gap-1.5 text-xs">
              <Eye className="w-5 h-5" />
              4,200
            </Text>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${isLiked ? "text-red-500" : "hover:text-red-500"}`}>
              <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.25 }}>
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              </motion.div>
              <Text className="text-xs font-medium">{likeCount.toLocaleString()}</Text>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCommentModal(true)} className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <Text className="text-xs font-medium">148</Text>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleRepost} className={`flex items-center gap-1.5 transition-colors ${isReposted ? "text-green-500" : "hover:text-green-500"}`}>
              <Repeat2 className={`w-4 h-4 ${isReposted ? "fill-current" : ""}`} />
              <Text className="text-xs font-medium">{repostCount}</Text>
            </motion.button>
          </View>
          <View className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleSave(id)} className={`transition-colors ${isSaved ? "text-yellow-500" : "hover:text-yellow-500"}`}>
              <motion.div animate={isSaved ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.25 }}>
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              </motion.div>
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowShareModal(true)} className="hover:text-foreground transition-colors">
              <Share className="w-4 h-4" />
            </motion.button>
            <button className="hover:text-foreground transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </View>
        </View>
      </View>

      <AnimatePresence>
        {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
        {showCommentModal && <CommentModal onClose={() => setShowCommentModal(false)} postId={postId} />}
      </AnimatePresence>
    </>
  );
}

// ─── Nav Section Config ───────────────────────────────────────────────────────

type NavSection = "home" | "shop" | "games" | "campus" | "events" | "discover" | "jobs";

const NAV_SECTIONS: { key: NavSection; label: string; Icon: React.ElementType }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "shop", label: "Shop", Icon: ShoppingBag },
  { key: "games", label: "Games", Icon: Gamepad2 },
  { key: "campus", label: "Campus", Icon: GraduationCap },
  { key: "events", label: "Events", Icon: Calendar },
  { key: "discover", label: "Board", Icon: Trophy },
  { key: "jobs", label: "Alerts", Icon: Bell },
];

// ─── HomeScreen ───────────────────────────────────────────────────────────────

type TabType = "campus" | "trending" | "new";

export function HomeScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("campus");
  const [activeSection, setActiveSection] = useState<NavSection>("home");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showFAB, setShowFAB] = useState(true);
  const [showFABMenu, setShowFABMenu] = useState(false);
  const [showCreateStatus, setShowCreateStatus] = useState(false);
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const tabs: TabType[] = ["campus", "trending", "new"];
  const tabLabels: Record<TabType, string> = { campus: "Campus", trending: "Trending", new: "New" };

  const viewableStories = stories.filter((s) => !s.type);

  useEffect(() => {
    if (!user) return;

    const loadFeed = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, author_name, author_username, author_avatar, content, image, views, likes, comments, created_at")
        .order("created_at", { ascending: false })
        .limit(15);

      if (error) {
        console.error("Failed to load posts from Supabase:", error.message);
        setFeedPosts([]);
      } else if (data) {
        setFeedPosts(
          data.map((row) => ({
            id: row.id,
            authorName: row.author_name,
            authorUsername: row.author_username,
            authorAvatar: row.author_avatar,
            content: row.content,
            image: row.image,
            views: row.views ?? 0,
            likes: row.likes ?? 0,
            comments: row.comments ?? 0,
            created_at: row.created_at,
          }))
        );
      }
      setLoadingPosts(false);
    };

    loadFeed();
  }, [user]);

  const handlePostStatus = (storyData: Omit<Story, "id" | "isMyStory" | "views" | "timestamp">) => {
    const newStory: Story = {
      ...storyData,
      id: Date.now(),
      isMyStory: true,
      views: 0,
      timestamp: "just now",
    };
    setStories([stories[0], newStory, ...stories.slice(1)]);
  };

  const handleLikeStory = (id: number) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, likedByMe: !s.likedByMe, likes: s.likedByMe ? (s.likes || 0) - 1 : (s.likes || 0) + 1 } : s
      )
    );
  };

  const handleDeleteStory = (id: number) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    setViewingStoryIndex(null);
  };

  const handleViewStory = (story: Story) => {
    if (story.type === "add") { setShowCreateStatus(true); return; }
    setStories((prev) =>
      prev.map((s) => s.id === story.id ? { ...s, views: (s.views || 0) + 1, hasUnseen: false } : s)
    );
    const idx = viewableStories.findIndex((s) => s.id === story.id);
    setViewingStoryIndex(idx);
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = scrollRef.current?.scrollTop || 0;
      if (y > lastScrollY.current && y > 60) { setShowFAB(false); setShowFABMenu(false); }
      else if (y < lastScrollY.current) { setShowFAB(true); }
      lastScrollY.current = y;
    };
    const el = scrollRef.current;
    el?.addEventListener("scroll", handleScroll);
    return () => el?.removeEventListener("scroll", handleScroll);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    const idx = tabs.indexOf(activeTab);
    if (d > 50 && idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
    if (d < -50 && idx > 0) setActiveTab(tabs[idx - 1]);
  };

  const renderSection = () => {
    if (activeSection !== "home") {
      const labels: Record<NavSection, string> = {
        home: "Home", shop: "Shop 🛍️", games: "Games 🎮", campus: "Campus 🎓",
        events: "Events 📅", discover: "Leaderboard 🏆", jobs: "Notifications 🔔",
      };
      return (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center justify-center h-80 gap-3"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-6xl"
          >
            {activeSection === "shop" ? "🛍️" : activeSection === "games" ? "🎮" : activeSection === "campus" ? "🎓" : activeSection === "events" ? "📅" : activeSection === "discover" ? "🏆" : "🔔"}
          </motion.div>
          <Text className="text-lg font-bold text-foreground">{labels[activeSection]}</Text>
          <Text className="text-sm text-muted-foreground">Coming soon</Text>
        </motion.div>
      );
    }

    return (
      <>
        {/* Stories */}
        <View className="px-4 py-4 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
              onClick={() => handleViewStory(story)}
            >
              {story.type === "add" ? (
                <View className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </View>
              ) : (
                <View className={`w-16 h-16 rounded-full p-0.5 ${story.hasUnseen ? "bg-gradient-to-tr from-yellow-400 to-fuchsia-600" : "bg-muted"}`}>
                  {story.mediaType === "text" ? (
                    <View className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-background" style={{ background: story.bgColor }}>
                      Aa
                    </View>
                  ) : (
                    <img src={story.mediaUrl} alt={story.name} className="w-full h-full rounded-full border-2 border-background object-cover hover:opacity-80 transition-opacity" />
                  )}
                </View>
              )}
              <Text className="text-xs text-muted-foreground font-medium w-16 text-center truncate">
                {story.type === "add" ? "Add Story" : story.name}
              </Text>
            </motion.div>
          ))}
        </View>

        {/* Feed Tabs */}
        <View ref={tabsRef} className="relative">
          <View className="flex px-4 gap-6 border-b border-border">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {tabLabels[tab]}
                {activeTab === tab && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
              </button>
            ))}
          </View>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="bg-muted/20 flex flex-col gap-2"
            >
              {feedPosts.length > 0 ? (
                feedPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <PostCard postId={`${activeTab}-post-1`} />
              )}
              <SponsoredPostCard post={SPONSORED_POSTS[0]} />
              <PostCard postId={`${activeTab}-post-2`} />
              <PostCard postId={`${activeTab}-post-3`} />
              <SponsoredPostCard post={SPONSORED_POSTS[1]} />
            </motion.div>
          </AnimatePresence>
        </View>
      </>
    );
  };

  return (
    <View
      className="flex flex-col h-full bg-background text-foreground relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top Bar */}
      <View className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
          <View className="relative">
            <img src="https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=40" alt="Me" className="w-10 h-10 rounded-full object-cover border border-border" />
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
          </View>
          <View className="flex flex-col">
            <View className="flex items-center gap-1">
              <Text className="font-bold text-foreground text-sm">Marcus J.</Text>
              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </View>
            <View className="flex items-center gap-2">
              <Text className="text-xs text-muted-foreground">@marcus_j</Text>
              <View className="flex items-center gap-0.5 bg-orange-500/10 px-1.5 rounded-full">
                <Text className="text-[10px] font-bold text-orange-600">🔥 12</Text>
              </View>
            </View>
          </View>
        </Link>

        <motion.h1
          className="text-xl font-black tracking-tight ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        >
          Blink
        </motion.h1>

        <View className="flex items-center gap-3 ml-auto pl-4">
          <button className="text-foreground/90 hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
          <Link to="/menu" className="text-foreground/90 hover:text-foreground transition-colors">
            <MoreVertical className="w-6 h-6" />
          </Link>
        </View>
      </View>

      {/* Section Nav */}
      <View className="flex border-b border-border bg-background/95 backdrop-blur-sm overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {NAV_SECTIONS.map(({ key, label, Icon }) => (
          <motion.button
            key={key}
            onClick={() => setActiveSection(key)}
            whileTap={{ scale: 0.94 }}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 text-xs font-semibold transition-colors relative shrink-0 ${activeSection === key ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeSection === key && (
              <motion.div layoutId="activeSection" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
          </motion.button>
        ))}
      </View>

      {/* Scrollable content */}
      <View ref={scrollRef} className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {renderSection()}
      </View>

      {/* FAB */}
      <AnimatePresence>
        {showFAB && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute bottom-20 right-5 z-40 flex flex-col gap-3 items-end"
          >
            <AnimatePresence>
              {showFABMenu && (
                <>
                  {[
                    { label: "Create Ad", icon: Megaphone, gradient: "from-purple-500 to-pink-500", delay: 0.05 },
                    { label: "New Post", icon: PenSquare, gradient: "from-blue-500 to-cyan-500", delay: 0 },
                  ].map(({ label, icon: Icon, gradient, delay }) => (
                    <motion.button
                      key={label}
                      initial={{ scale: 0, x: 20 }}
                      animate={{ scale: 1, x: 0 }}
                      exit={{ scale: 0, x: 20 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25, delay }}
                      className="flex items-center gap-3 group"
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white shadow-lg px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                      <View className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </View>
                    </motion.button>
                  ))}
                </>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setShowFABMenu((v) => !v)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: showFABMenu ? 45 : 0 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />

      {/* Modals */}
      <AnimatePresence>
        {showCreateStatus && (
          <CreateStoryModal onClose={() => setShowCreateStatus(false)} onPost={handlePostStatus} />
        )}
        {viewingStoryIndex !== null && (
          <StoryViewer
            stories={viewableStories}
            initialIndex={viewingStoryIndex}
            onClose={() => setViewingStoryIndex(null)}
            onLike={handleLikeStory}
            onDelete={handleDeleteStory}
          />
        )}
      </AnimatePresence>
    </View>
  );
}