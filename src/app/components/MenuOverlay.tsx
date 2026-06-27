import { useState, useEffect } from "react";
import { X, User, Crown, Coins, Users, Settings, ArrowLeft, Sun, Moon, Monitor } from "lucide-react";
import { useNavigate } from "react-router";
import { HomeScreen } from "./HomeScreen";

type ThemeMode = "light" | "dark" | "system";

export function MenuOverlay() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  
  // Default fallback changed from "system" to "dark"
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme") as ThemeMode) || "dark";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (mode: ThemeMode) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (mode === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(mode);
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
  };

  const MENU_ITEMS = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Crown, label: "Premium", path: "#" },
    { icon: Coins, label: "Earn Coin", path: "#" },
    { icon: Users, label: "Community", path: "#" },
    { icon: Settings, label: "Settings", path: "trigger-settings" },
  ];

  return (
    <div className="relative h-full w-full bg-background text-foreground">
      <HomeScreen />
      
      {/* Full-screen Overlay responding natively to current theme colors */}
      <div className="absolute inset-0 bg-background/95 text-foreground z-50 backdrop-blur-md animate-in fade-in duration-200">
        
        {showSettings ? (
          /* --- SETTINGS OVERLAY VIEW --- */
          <>
            <div className="flex items-center justify-between p-6">
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <span className="text-xl font-bold">Settings</span>
              <div className="w-10" />
            </div>

            <div className="flex flex-col gap-2 px-8 mt-4">
              <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2 px-2">App Theme</p>
              
              {/* Light Mode Option */}
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group ${theme === "light" ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Sun className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">Light Mode</span>
                </div>
                {theme === "light" && <div className="w-3 h-3 bg-primary rounded-full" />}
              </button>

              {/* Dark Mode Option */}
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group ${theme === "dark" ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Moon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">Dark Mode</span>
                </div>
                {theme === "dark" && <div className="w-3 h-3 bg-primary rounded-full" />}
              </button>

              {/* Device Default Option */}
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group ${theme === "system" ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight">Device Default</span>
                </div>
                {theme === "system" && <div className="w-3 h-3 bg-primary rounded-full" />}
              </button>
            </div>
          </>
        ) : (
          /* --- MAIN MENU VIEW --- */
          <>
            <div className="flex justify-end p-6">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2 px-8 mt-4">
              {MENU_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (item.path === "trigger-settings") {
                        setShowSettings(true);
                      } else if (item.path !== "#") {
                        navigate(item.path);
                      } else {
                        navigate(-1);
                      }
                    }}
                    className="flex items-center gap-6 py-5 hover:bg-muted/50 rounded-2xl px-4 transition-colors -mx-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        
      </div>
    </div>
  );
}