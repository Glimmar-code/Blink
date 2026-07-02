import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { UserProfile } from "../components/UserProfile";

// Mock user registry — keyed by username
const USER_DB: Record<string, {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: "blue" | "yellow" | null;
  online: boolean;
  lastSeen: string;
  bio: string;
  followers: number;
  following: number;
}> = {
  sarah_m: {
    id: "u1",
    name: "Sarah Mitchell",
    username: "sarah_m",
    avatar: "https://images.unsplash.com/photo-1544168190-79c17527004f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    verified: "blue",
    online: true,
    lastSeen: "just now",
    bio: "Final year Law student. Coffee addict. Aspiring human rights attorney.",
    followers: 3200,
    following: 410,
  },
  mike_b: {
    id: "u2",
    name: "Mike Brooks",
    username: "mike_b",
    avatar: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    verified: null,
    online: false,
    lastSeen: "3h ago",
    bio: "Engineering student. Basketball enthusiast. Building cool stuff.",
    followers: 890,
    following: 320,
  },
  jess_smith: {
    id: "u3",
    name: "Jessica Smith",
    username: "jess_smith",
    avatar: "https://images.unsplash.com/photo-1708098746991-ad0a97313727?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    verified: "blue",
    online: true,
    lastSeen: "just now",
    bio: "Med student by day, photographer by night. Capturing campus life one shot at a time.",
    followers: 5100,
    following: 280,
  },
  david_k: {
    id: "u4",
    name: "David Kamara",
    username: "david_k",
    avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    verified: "yellow",
    online: false,
    lastSeen: "1d ago",
    bio: "Economics student. Campus Rep. Entrepreneur in the making.",
    followers: 12400,
    following: 150,
  },
  aisha_b: {
    id: "u5",
    name: "Aisha Bello",
    username: "aisha_b",
    avatar: "https://i.pravatar.cc/200?img=1",
    verified: null,
    online: true,
    lastSeen: "just now",
    bio: "Biochemistry student. Research intern. Passionate about STEM outreach.",
    followers: 2300,
    following: 560,
  },
  chidi_ok: {
    id: "u6",
    name: "Chidi Okonkwo",
    username: "chidi_ok",
    avatar: "https://i.pravatar.cc/200?img=3",
    verified: null,
    online: false,
    lastSeen: "5h ago",
    bio: "Computer Science 300L. Open source contributor. Loves hackathons.",
    followers: 1700,
    following: 430,
  },
  ada_ok: {
    id: "u7",
    name: "Ada Okafor",
    username: "ada_ok",
    avatar: "https://i.pravatar.cc/200?img=20",
    verified: "blue",
    online: true,
    lastSeen: "just now",
    bio: "Journalism & Mass Comm. Campus blogger. Storyteller.",
    followers: 7800,
    following: 900,
  },
};

function buildFallbackUser(username: string) {
  return {
    id: username,
    name: username.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    username,
    avatar: `https://i.pravatar.cc/200?u=${username}`,
    verified: null as null,
    online: false,
    lastSeen: "recently",
    bio: "",
    followers: 0,
    following: 0,
  };
}

export function UserProfilePage() {
  const { username = "" } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const user = USER_DB[username] ?? buildFallbackUser(username);

  const [isFollowing, setIsFollowing] = useState(false);

  const handleMessage = () => {
    navigate(`/messages/${username}`);
  };

  return (
    <UserProfile
      user={user}
      isFollowing={isFollowing}
      onToggleFollow={() => setIsFollowing((v) => !v)}
      onBack={() => navigate(-1)}
      onMessage={handleMessage}
    />
  );
}
