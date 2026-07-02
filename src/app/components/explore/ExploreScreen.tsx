import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, TrendingUp, Clock } from "lucide-react";
import { PartnerFinder } from "./PartnerFinder";
import { PostCard } from "./PostCard";
import { PeopleCard } from "./PeopleCard";
import { TagCard } from "./TagCard";
import { EmptyState } from "./EmptyState";
import { POSTS, TAGS, USERS } from "./data";
import { BottomNav } from "../BottomNav";

export function ExploreScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "people" | "tags">("posts");
  const [sort, setSort] = useState<"trending" | "newest">("trending");

  const goToProfile = (id: string) => {
    const user = USERS.find((u) => u.id === id);
    if (user) {
      navigate(`/profile/${user.username}`);
      return;
    }
    navigate(`/profile/${id}`);
  };

  const goToDM = (id: string) => {
    navigate("/messages");
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
    <>

    <div className="flex-1 bg-background flex flex-col pt-14 pb-20 h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Explore</h1>
      </div>

      <div className="px-4 mt-1">
        <PartnerFinder onGoToProfile={goToProfile} onGoToDM={goToDM} />
      </div>

      <div className="px-4 mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Discover
        </p>
      </div>

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
                <span className="text-muted-foreground">#</span>
                {tag.name}
                <span className="text-muted-foreground ml-0.5">
                  {formatCount(tag.count)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-14 z-20">
        <div className="flex items-center px-4">
          <div className="flex flex-1">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-3 text-sm font-semibold relative ${
                  activeTab === key ? "text-foreground" : "text-muted-foreground"
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
      <BottomNav />

    </>
 
  );
}

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}
