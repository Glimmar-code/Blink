import { View, Text } from "react-native";
import { ArrowLeft, MoreVertical, Heart, MessageCircle, Share, Bookmark, Send } from "lucide-react";
import { useNavigate } from "react-router";

const COMMENTS = [
  {
    id: 1,
    user: {
      name: "Marcus Johnson",
      username: "marcus_j",
      avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc4MjQ3MjA5OXww&ixlib=rb-4.1.0&q=80&w=200"
    },
    text: "Bro that study group saved me 😂 Let's link up again for finals.",
    time: "1h",
    likes: 12
  },
  {
    id: 2,
    user: {
      name: "Sarah Jenkins",
      username: "sarahj",
      avatar: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbGxlZ2UlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDcyMDk0fDA&ixlib=rb-4.1.0&q=80&w=200"
    },
    text: "So jealous! I had to work all day 😭",
    time: "45m",
    likes: 4
  }
];

export function PostDetailScreen() {
  const navigate = useNavigate();

  return (
    <View className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <View className="flex items-center px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center mr-8">Post</h1>
      </View>

      <View className="flex-1 overflow-y-auto pb-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Main Post */}
        <View className="px-4 py-5 border-b border-gray-100 flex flex-col gap-4">
          <View className="flex items-center justify-between">
            <View className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1708098746991-ad0a97313727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDQwMTI2fDA&ixlib=rb-4.1.0&q=80&w=200" 
                alt="Avatar" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <View>
                <View className="flex items-center gap-1">
                  <Text className="font-bold text-gray-900">Jessica Smith</Text>
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </View>
                <Text className="text-gray-500 text-sm">@jess_smith • 2h</Text>
              </View>
            </View>
            <button className="text-gray-400">
              <MoreVertical className="w-6 h-6" />
            </button>
          </View>

          <Text className="text-[15px] text-gray-900 leading-relaxed">
            Just wrapped up midterms! 🎉 The campus vibe is amazing today. Anyone down for a study group later? #CampusLife #Midterms
          </Text>
          <View className="rounded-2xl overflow-hidden border border-gray-100">
            <img 
              src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBsaWZlfGVufDF8fHx8MTc4MjQ3MjA5Nnww&ixlib=rb-4.1.0&q=80&w=800" 
              alt="Campus" 
              className="w-full h-64 object-cover"
            />
          </View>

          <View className="flex items-center justify-between pt-3 text-gray-500 border-t border-gray-100 mt-2">
            <View className="flex items-center gap-6">
              <button className="flex items-center gap-1.5 hover:text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <Text className="text-sm font-medium">4.2k</Text>
              </button>
              <button className="flex items-center gap-1.5 hover:text-black">
                <Heart className="w-5 h-5" />
                <Text className="text-sm font-medium">1.2k</Text>
              </button>
              <button className="flex items-center gap-1.5 text-black">
                <MessageCircle className="w-5 h-5 fill-black" />
                <Text className="text-sm font-medium">148</Text>
              </button>
              <button className="flex items-center gap-1.5 hover:text-black">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <Text className="text-sm font-medium">12</Text>
              </button>
            </View>
            <View className="flex items-center gap-4">
              <button className="hover:text-black">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="hover:text-black">
                <Share className="w-5 h-5" />
              </button>
              <button className="hover:text-black">
                <MoreVertical className="w-5 h-5" />
              </button>
            </View>
          </View>
        </View>

        {/* Comments Section */}
        <View className="flex flex-col">
          {COMMENTS.map(comment => (
            <View key={comment.id} className="flex gap-3 px-4 py-4 border-b border-gray-50">
              <img src={comment.user.avatar} alt={comment.user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              <View className="flex-1">
                <View className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <View className="flex items-center gap-2 mb-1">
                    <Text className="font-bold text-sm text-gray-900">{comment.user.name}</Text>
                    <Text className="text-xs text-gray-500">{comment.time}</Text>
                  </View>
                  <Text className="text-sm text-gray-800">{comment.text}</Text>
                </View>
                <View className="flex items-center gap-4 mt-2 px-2">
                  <button className="text-xs font-bold text-gray-500 hover:text-black">Reply</button>
                  <button className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1">
                    Like <Text className="font-normal text-gray-400">({comment.likes})</Text>
                  </button>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Comment Input */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <img 
          src="https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbGxlZ2UlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDcyMDk0fDA&ixlib=rb-4.1.0&q=80&w=200" 
          alt="My Avatar" 
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <View className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Write a comment..." 
            className="w-full bg-gray-100 border-none rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </View>
      </View>
    </View>
  );
}
