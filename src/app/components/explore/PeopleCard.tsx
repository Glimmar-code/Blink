import { useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import type { UserProfile } from "./types";
import { Avatar } from "./Avatar";
import { formatCount } from "./utils";

export function PeopleCard({ user, onGoToProfile }: { user: UserProfile; onGoToProfile: (id: string) => void }) {
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
            <span className="font-semibold text-sm text-foreground">{user.name}</span>
            {user.badge !== "none" && <span className="text-blue-500">●</span>}
          </div>
          <span className="text-muted-foreground text-xs">@{user.username}</span>
          <p className="text-muted-foreground text-xs mt-0.5 truncate">{user.bio}</p>
          <div className="flex gap-2 mt-1 flex-wrap text-[10px] text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded-full">{user.university}</span>
            <span className="bg-muted px-2 py-1 rounded-full">{user.level}</span>
            <span className="bg-muted px-2 py-1 rounded-full">{formatCount(count)} followers</span>
          </div>
        </div>
        <button
          onClick={toggle}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
            followed ? "bg-muted text-foreground" : "bg-foreground text-background"
          }`}
        >
          {followed ? (
            <>
              <UserCheck size={12} /> Following
            </>
          ) : (
            <>
              <UserPlus size={12} /> Follow
            </>
          )}
        </button>
      </div>
    </div>
  );
}
