import { useState, useCallback } from "react";
import { RefreshCw, Shuffle, UserCheck, UserPlus, MessageCircle } from "lucide-react";
import type { UserProfile } from "./types";
import { USERS } from "./data";
import { Dropdown } from "./Dropdown";
import { Avatar } from "./Avatar";

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
const LEVELS = ["Any Level", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export function PartnerFinder({
  onGoToProfile,
  onGoToDM,
}: {
  onGoToProfile: (id: string) => void;
  onGoToDM: (id: string) => void;
}) {
  const [university, setUniversity] = useState("Any University");
  const [gender, setGender] = useState("Any Gender");
  const [status, setStatus] = useState("Any Status");
  const [level, setLevel] = useState("Any Level");
  const [spinning, setSpinning] = useState(false);
  const [matched, setMatched] = useState<UserProfile | null>(null);
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});

  const getFollowers = (u: UserProfile) =>
    followerCounts[u.id] ?? u.followers;

  const spin = useCallback(() => {
    setSpinning(true);
    setMatched(null);
    setTimeout(() => {
      let pool = USERS.filter((u) => {
        if (university !== "Any University" && u.university !== university) return false;
        if (gender !== "Any Gender" && u.gender !== gender) return false;
        if (status !== "Any Status" && u.relationshipStatus !== status) return false;
        if (level !== "Any Level" && u.level !== level) return false;
        return true;
      });
      if (pool.length === 0) pool = USERS;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      setMatched(pick);
      setSpinning(false);
    }, 900);
  }, [gender, level, status, university]);

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
      <div className="bg-foreground rounded-2xl px-4 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <Shuffle size={16} className="text-background" />
          <h2 className="text-background font-bold text-base">Find a Match</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Dropdown label="University" options={UNIVERSITIES} value={university} onChange={setUniversity} />
          <Dropdown label="Gender" options={GENDERS} value={gender} onChange={setGender} />
          <Dropdown label="Status" options={STATUSES} value={status} onChange={setStatus} />
          <Dropdown label="Level" options={LEVELS} value={level} onChange={setLevel} />
        </div>
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full bg-background text-foreground rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
        >
          <RefreshCw size={15} className={spinning ? "animate-spin" : ""} />
          {spinning ? "Finding someone…" : "Spin & Match"}
        </button>
      </div>

      {matched && !spinning && (
        <div className="mt-3 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-pink-500" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar user={matched} size="lg" onClick={() => onGoToProfile(matched.id)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-foreground text-base">{matched.name}</span>
                  {matched.badge !== "none" && <span className="text-blue-500">●</span>}
                </div>
                <span className="text-muted-foreground text-xs">@{matched.username}</span>
                <p className="text-foreground/80 text-xs mt-1 leading-relaxed">{matched.bio}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {[matched.university, matched.level, matched.relationshipStatus].map((info) => (
                <span key={info} className="bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-full">
                  {info}
                </span>
              ))}
              <span className="bg-muted text-muted-foreground text-[11px] font-medium px-2.5 py-1 rounded-full">
                {formatCount(getFollowers(matched))} followers
              </span>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => toggleFollow(matched)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  followed[matched.id] ? "bg-muted text-foreground" : "bg-foreground text-background"
                }`}
              >
                {followed[matched.id] ? <><UserCheck size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
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

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}
