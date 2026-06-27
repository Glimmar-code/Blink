import { Home, Compass, Trophy, Bell, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router";

export function BottomNav() {
  const location = useLocation();

  const items = [
    { icon: Home, path: "/home", label: "Home" },
    { icon: Compass, path: "/explore", label: "Explore" },
    { icon: Trophy, path: "/leaderboard", label: "Leaderboard" },
    { icon: Bell, path: "/notifications", label: "Notifications" },
    { icon: MessageCircle, path: "/messages", label: "Messages" },
  ];

  return (
    <div className="bg-background border-t border-border flex items-center justify-between px-6 py-3 pb-6 shrink-0 z-40">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path) || (item.path === "/home" && location.pathname === "/");
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
            {/* Removing labels for a cleaner, modern look often found in mobile navs, 
                or keeping a tiny dot for active state. The prompt said "5 evenly spaced icons", 
                so we'll stick to just icons. */}
          </Link>
        );
      })}
    </div>
  );
}