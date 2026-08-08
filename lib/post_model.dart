/// Data models + mock data ported 1:1 from the Figma export's mock arrays
/// (STORIES, FEED_POSTS/GRAD_POSTS/PHOTO_POSTS, LEADERBOARD, MARKET_ITEMS,
/// CHATS, MY_GRID_IMGS, ACTIVITIES, COMMENTS_DATA).
///
/// Image fields store the Unsplash path fragment used in the Figma file
/// (e.g. "photo-xxxx?w=80&h=80&fit=crop"); [unsplash] turns that into a
/// full URL for Image.network. Swap these for real asset/network URLs
/// whenever you wire up a backend.
library models;

String unsplash(String path) => 'https://images.unsplash.com/$path';

// ─── Stories ────────────────────────────────────────────────────────────────

class Story {
  final int id;
  final String user;
  final String avatar;
  final bool isMe;
  final bool online;

  const Story({
    required this.id,
    required this.user,
    required this.avatar,
    this.isMe = false,
    required this.online,
  });
}

const stories = <Story>[
  Story(id: 0, user: 'You', avatar: 'photo-1529139574466-a303027c1d8b?w=80&h=80&fit=crop', isMe: true, online: true),
  Story(id: 1, user: 'zara.ed', avatar: 'photo-1509631179647-0177331693ae?w=80&h=80&fit=crop', online: true),
  Story(id: 2, user: 'marco_v', avatar: 'photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', online: false),
  Story(id: 3, user: 'luna', avatar: 'photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', online: true),
  Story(id: 4, user: 'alex_c', avatar: 'photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop', online: false),
  Story(id: 5, user: 'nadia.r', avatar: 'photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', online: true),
  Story(id: 6, user: 'kai.lens', avatar: 'photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', online: false),
];

// ─── Feed posts (text-gradient posts + photo posts, unified) ───────────────

enum PostType { text, photo }

class FeedPost {
  final String id;
  final PostType type;
  final String user;
  final String avatar;
  final String? faculty;
  final String time;
  final String? text; // text-gradient posts
  final List<String>? gradient; // hex strings, text posts only
  final String? image; // photo posts
  final String? caption; // photo posts
  int likes;
  final int comments;
  final int shares;
  bool liked;

  FeedPost({
    required this.id,
    required this.type,
    required this.user,
    required this.avatar,
    this.faculty,
    required this.time,
    this.text,
    this.gradient,
    this.image,
    this.caption,
    required this.likes,
    required this.comments,
    required this.shares,
    this.liked = false,
  });
}

final feedPosts = <FeedPost>[
  FeedPost(
    id: 'g1',
    type: PostType.text,
    user: 'sophia_kim',
    avatar: 'photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    faculty: 'SIMME',
    time: '3m',
    text: "Late nights in the studio hit different when you're building something that actually matters. #grind @marco_v knows.",
    gradient: const ['#1a0033', '#4a0080', '#ff006e'],
    likes: 4820,
    comments: 134,
    shares: 89,
  ),
  FeedPost(
    id: 'g2',
    type: PostType.text,
    user: 'dr.osei',
    avatar: 'photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    faculty: 'SBMS',
    time: '12m',
    text: 'Clinical rotation week 4. Sleep is a privilege. Coffee is a necessity. #medlife #SBMS',
    gradient: const ['#003333', '#006666', '#00ccaa'],
    likes: 2100,
    comments: 61,
    shares: 44,
  ),
  FeedPost(
    id: 'p1',
    type: PostType.photo,
    user: 'zara.editorial',
    avatar: 'photo-1509631179647-0177331693ae?w=80&h=80&fit=crop',
    faculty: null,
    time: '25m',
    image: 'photo-1483985988355-763728e1935b?w=600&h=500&fit=crop',
    caption: 'Autumn collection drops tonight ✦ #fashion @luna',
    likes: 12000,
    comments: 561,
    shares: 24000,
  ),
  FeedPost(
    id: 'p2',
    type: PostType.photo,
    user: 'luna.style',
    avatar: 'photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    faculty: null,
    time: '1h',
    image: 'photo-1515886657613-9f3515b0c78f?w=600&h=500&fit=crop',
    caption: 'Golden hour never misses ✨ @zara.editorial',
    likes: 8400,
    comments: 212,
    shares: 3100,
  ),
];

// ─── Leaderboard ────────────────────────────────────────────────────────────

class LeaderboardUser {
  final int rank;
  final String user;
  final String? faculty;
  final int pts;
  final String badge;
  final String avatar;

  const LeaderboardUser({
    required this.rank,
    required this.user,
    this.faculty,
    required this.pts,
    required this.badge,
    required this.avatar,
  });
}

const leaderboard = <LeaderboardUser>[
  LeaderboardUser(rank: 1, user: 'zara.editorial', faculty: null, pts: 98700, badge: '🏆', avatar: 'photo-1509631179647-0177331693ae?w=80&h=80&fit=crop'),
  LeaderboardUser(rank: 2, user: 'dr.osei', faculty: 'SBMS', pts: 84200, badge: '🥈', avatar: 'photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop'),
  LeaderboardUser(rank: 3, user: 'sophia_kim', faculty: 'SIMME', pts: 71500, badge: '🥉', avatar: 'photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop'),
  LeaderboardUser(rank: 4, user: 'luna.style', faculty: null, pts: 56100, badge: '⭐', avatar: 'photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'),
  LeaderboardUser(rank: 5, user: 'marco_v', faculty: 'SIMME', pts: 43800, badge: '⭐', avatar: 'photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'),
];

// ─── Market ─────────────────────────────────────────────────────────────────

class MarketItem {
  final int id;
  final String title;
  final String price;
  final String img;
  final String seller;
  final String tag;

  const MarketItem({
    required this.id,
    required this.title,
    required this.price,
    required this.img,
    required this.seller,
    required this.tag,
  });
}

const marketItems = <MarketItem>[
  MarketItem(id: 1, title: 'Vintage Leather Jacket', price: '₵280', img: 'photo-1551028719-00167b16eac5?w=200&h=200&fit=crop', seller: 'zara.editorial', tag: 'Fashion'),
  MarketItem(id: 2, title: 'Medical Anatomy Atlas', price: '₵95', img: 'photo-1532012197267-da84d127e765?w=200&h=200&fit=crop', seller: 'dr.osei', tag: 'Books'),
  MarketItem(id: 3, title: 'Canon EF 50mm f/1.8', price: '₵650', img: 'photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop', seller: 'luna.style', tag: 'Tech'),
  MarketItem(id: 4, title: 'Graphic Design Course', price: '₵45', img: 'photo-1626785774573-4b799315345d?w=200&h=200&fit=crop', seller: 'kai.lens', tag: 'Course'),
];

// ─── Chats ──────────────────────────────────────────────────────────────────

class Chat {
  final int id;
  final String user;
  final String avatar;
  final String lastMsg;
  final String time;
  final int unread;
  final bool online;

  const Chat({
    required this.id,
    required this.user,
    required this.avatar,
    required this.lastMsg,
    required this.time,
    required this.unread,
    required this.online,
  });
}

const chats = <Chat>[
  Chat(id: 1, user: 'zara.editorial', avatar: 'photo-1529139574466-a303027c1d8b?w=80&h=80&fit=crop', lastMsg: 'Dropping the collab next week 🔥', time: '2m', unread: 3, online: true),
  Chat(id: 2, user: 'marco_v', avatar: 'photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', lastMsg: 'Bro check the new edit', time: '15m', unread: 1, online: true),
  Chat(id: 3, user: 'sophia_kim', avatar: 'photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', lastMsg: 'Thank you!! 🙏', time: '1h', unread: 0, online: false),
  Chat(id: 4, user: 'luna.style', avatar: 'photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', lastMsg: "Can't wait for the shoot", time: '3h', unread: 0, online: false),
];

class ChatMessage {
  final int id;
  final String from; // 'me' | 'them'
  final String text;
  final String time;

  const ChatMessage({required this.id, required this.from, required this.text, required this.time});
}

List<ChatMessage> mockThreadFor(Chat chat) => [
      const ChatMessage(id: 1, from: 'them', text: 'Dropping the collab next week 🔥', time: '2:14 PM'),
      const ChatMessage(id: 2, from: 'me', text: "Can't wait!! What are we shooting?", time: '2:15 PM'),
      const ChatMessage(id: 3, from: 'them', text: 'Editorial concept — think Balenciaga meets street 🔥', time: '2:16 PM'),
    ];

// ─── Profile grid ───────────────────────────────────────────────────────────

const myGridImages = <String>[
  'photo-1509631179647-0177331693ae?w=200&h=260&fit=crop',
  'photo-1469334031218-e382a71b716b?w=200&h=180&fit=crop',
  'photo-1529139574466-a303027c1d8b?w=200&h=200&fit=crop',
  'photo-1515886657613-9f3515b0c78f?w=200&h=300&fit=crop',
  'photo-1483985988355-763728e1935b?w=200&h=180&fit=crop',
  'photo-1490481651871-ab68de25d43d?w=200&h=220&fit=crop',
];

// ─── Activity feed (menu sheet) ─────────────────────────────────────────────

class ActivityItem {
  final int id;
  final String user;
  final String action;
  final String time;
  final String avatar;

  const ActivityItem({
    required this.id,
    required this.user,
    required this.action,
    required this.time,
    required this.avatar,
  });
}

const activities = <ActivityItem>[
  ActivityItem(id: 1, user: 'sophia_kim', action: 'liked your post', time: '2m', avatar: 'photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop'),
  ActivityItem(id: 2, user: 'marco_v', action: 'started following you', time: '5m', avatar: 'photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop'),
  ActivityItem(id: 3, user: 'luna_style', action: 'commented on your reel', time: '12m', avatar: 'photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop'),
  ActivityItem(id: 4, user: 'dr.osei', action: 'saved your post', time: '1h', avatar: 'photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop'),
];

// ─── Comments ───────────────────────────────────────────────────────────────

class CommentReply {
  final int id;
  final String user;
  final String avatar;
  final String text;

  const CommentReply({required this.id, required this.user, required this.avatar, required this.text});
}

class Comment {
  final int id;
  final String user;
  final String avatar;
  final String text;
  final String time;
  int likes;
  bool liked;
  final List<CommentReply> replies;

  Comment({
    required this.id,
    required this.user,
    required this.avatar,
    required this.text,
    required this.time,
    required this.likes,
    this.liked = false,
    this.replies = const [],
  });
}

List<Comment> mockComments() => [
      Comment(
        id: 1,
        user: 'marco_v',
        avatar: 'photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
        text: 'This is fire 🔥🔥 @sophia_kim you have to see this',
        time: '10m',
        likes: 84,
        replies: const [
          CommentReply(id: 11, user: 'sophia_kim', avatar: 'photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', text: "I'm obsessed 😍"),
        ],
      ),
      Comment(
        id: 2,
        user: 'luna.style',
        avatar: 'photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
        text: 'The lighting on this is unreal ✨ #editorial',
        time: '32m',
        likes: 46,
      ),
      Comment(
        id: 3,
        user: 'kai.lens',
        avatar: 'photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
        text: 'Need the BTS of this shoot please',
        time: '1h',
        likes: 12,
      ),
    ];