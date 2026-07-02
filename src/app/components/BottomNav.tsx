import { Home, Search, Trophy, Bell, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { icon: Home,          label: "Home",          to: "/home" },
  { icon: Search,        label: "Explore",       to: "/explore" },
  { icon: Trophy,        label: "Leaderboard",   to: "/leaderboard" },
  { icon: Bell,          label: "Notifications", to: "/notifications" },
  { icon: MessageCircle, label: "Messages",      to: "/messages" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav shrink-0 flex items-center justify-around px-1 py-2 bg-background border-t border-border">
      {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
        const isActive = pathname === to || (to !== "/home" && pathname.startsWith(to));

        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            className="relative flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <motion.div
              whileTap={{ scale: 0.8 }}
              className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-blue-50" : ""}`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${isActive ? "text-blue-600" : "text-muted-foreground"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </motion.div>
            <span className={`text-[10px] font-semibold transition-colors ${isActive ? "text-blue-600" : "text-muted-foreground"}`}>
              {label}
            </span>
            {isActive && (
              <motion.span
                layoutId="navDot"
                className="absolute -top-0.5 w-1 h-1 rounded-full bg-blue-500"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
