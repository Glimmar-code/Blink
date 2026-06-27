import { Plus, MoreVertical, MessageCircle, Heart, Share, Bookmark, Flag } from "lucide-react";
import { Link } from "react-router";

const STORIES = [
  { id: 1, type: "add" },
  { id: 2, image: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbGxlZ2UlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDcyMDk0fDA&ixlib=rb-4.1.0&q=80&w=200", name: "Sarah", hasUnseen: true },
  { id: 3, image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwbGF1Z2hpbmd8ZW58MXx8fHwxNzgyNDA4MTU1fDA&ixlib=rb-4.1.0&q=80&w=200", name: "Mike", hasUnseen: true },
  { id: 4, image: "https://images.unsplash.com/photo-1708098746991-ad0a97313727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDQwMTI2fDA&ixlib=rb-4.1.0&q=80&w=200", name: "Jessica", hasUnseen: false },
  { id: 5, image: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc4MjQ3MjA5OXww&ixlib=rb-4.1.0&q=80&w=200", name: "David", hasUnseen: false },
];

export function PostCard() {
  return (
    <div className="bg-card px-4 py-5 border-b border-border flex flex-col gap-3 text-card-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://images.unsplash.com/photo-1708098746991-ad0a97313727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDQwMTI2fDA&ixlib=rb-4.1.0&q=80&w=200" 
            alt="Avatar" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground text-sm">Jessica Smith</span>
              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-muted-foreground text-xs">@jess_smith • 2h</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-foreground text-background text-xs font-semibold px-4 py-1.5 rounded-full hover:opacity-90">
            Follow
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <Link to="/post/123" className="block cursor-pointer">
        <p className="text-sm text-foreground/90 leading-relaxed">
          Just wrapped up midterms! 🎉 The campus vibe is amazing today. Anyone down for a study group later? #CampusLife #Midterms
        </p>
        <div className="mt-3 rounded-2xl overflow-hidden border border-border">
          <img 
            src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1wdXMlMjBsaWZlfGVufDF8fHx8MTc4MjQ3MjA5Nnww&ixlib=rb-4.1.0&q=80&w=800" 
            alt="Campus" 
            className="w-full h-56 object-cover"
          />
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between mt-1 text-muted-foreground pt-1">
        <div className="flex items-center gap-5">
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs font-medium">4.2k</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-medium">1.2k</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-medium">148</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium">12</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="hover:text-foreground">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="hover:text-foreground">
            <Share className="w-4 h-4" />
          </button>
          <button className="hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className="flex flex-col h-full bg-background text-foreground relative">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGNvbGxlZ2UlMjBzdHVkZW50JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzgyNDcyMDk0fDA&ixlib=rb-4.1.0&q=80&w=200" 
              alt="My Avatar" 
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-foreground text-sm">Marcus J.</span>
              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">@marcus_j</span>
              <div className="flex items-center gap-0.5 bg-orange-500/10 px-1.5 rounded-full">
                <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">🔥 12</span>
              </div>
            </div>
          </div>
        </Link>
        
        <h1 className="text-xl font-black tracking-tight ml-4">BlacApp</h1>

        <div className="flex items-center gap-3 ml-auto pl-4">
          <button className="text-foreground/90 hover:text-foreground">
            <Flag className="w-5 h-5" />
          </button>
          <Link to="/menu" className="text-foreground/90 hover:text-foreground">
            <MoreVertical className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Story Section */}
        <div className="px-4 py-4 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {STORIES.map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
              {story.type === "add" ? (
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center relative bg-muted/50 hover:bg-muted transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-full p-0.5 ${story.hasUnseen ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-muted'}`}>
                  <img src={story.image} alt={story.name} className="w-full h-full rounded-full border-2 border-background object-cover" />
                </div>
              )}
              <span className="text-xs text-muted-foreground font-medium">{story.type === "add" ? "Add Story" : story.name}</span>
            </div>
          ))}
        </div>

        {/* Feed Tabs */}
        <div className="flex px-4 gap-6 border-b border-border">
          <button className="pb-3 text-sm font-bold border-b-2 border-foreground text-foreground">
            Campus
          </button>
          <button className="pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            Trending
          </button>
          <button className="pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
            New
          </button>
        </div>

        {/* Post Feed */}
        <div className="bg-muted/20 flex flex-col gap-2">
          <PostCard />
          <PostCard />
          <PostCard />
        </div>
      </div>
    </div>
  );
}