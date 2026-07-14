import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { X, User, Crown, Coins, Users, Settings, ArrowLeft, Sun, Moon, Monitor, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { HomeScreen } from "./HomeScreen";

type ThemeMode = "light" | "dark" | "system";

export function MenuOverlay() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const { signOut } = useAuth();
  
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
    { icon: LogOut, label: "Log out", path: "logout" },
  ];

  return (
    <View className="relative h-full w-full bg-background text-foreground">
      <HomeScreen />
      
      {/* Full-screen Overlay responding natively to current theme colors */}
      <View className="absolute inset-0 bg-background/95 text-foreground z-50 backdrop-blur-md animate-in fade-in duration-200">
        
        {showSettings ? (
          /* --- SETTINGS OVERLAY VIEW --- */
          <>
            <View className="flex items-center justify-between p-6">
              <button 
                onClick={() => setShowSettings(false)} 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Text className="text-xl font-bold">Settings</Text>
              <View className="w-10" />
            </View>

            <View className="flex flex-col gap-2 px-8 mt-4">
              <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-2 px-2">App Theme</Text>
              
              {/* Light Mode Option */}
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group ${theme === "light" ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <View className="flex items-center gap-6">
                  <View className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Sun className="w-6 h-6" />
                  </View>
                  <Text className="text-2xl font-bold tracking-tight">Light Mode</Text>
                </View>
                {theme === "light" && <View className="w-3 h-3 bg-primary rounded-full" />}
              </button>

              {/* Dark Mode Option */}
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group ${theme === "dark" ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <View className="flex items-center gap-6">
                  <View className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Moon className="w-6 h-6" />
                  </View>
                  <Text className="text-2xl font-bold tracking-tight">Dark Mode</Text>
                </View>
                {theme === "dark" && <View className="w-3 h-3 bg-primary rounded-full" />}
              </button>

              {/* Device Default Option */}
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group ${theme === "system" ? "bg-muted" : "hover:bg-muted/50"}`}
              >
                <View className="flex items-center gap-6">
                  <View className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Monitor className="w-6 h-6" />
                  </View>
                  <Text className="text-2xl font-bold tracking-tight">Device Default</Text>
                </View>
                {theme === "system" && <View className="w-3 h-3 bg-primary rounded-full" />}
              </button>

              {/* Logout Option - visible under Settings */}
              <button
                onClick={async () => {
                  await signOut();
                  navigate("/auth");
                }}
                className="flex items-center justify-between py-5 rounded-2xl px-4 transition-colors group hover:bg-muted/50 mt-4"
              >
                <View className="flex items-center gap-6">
                  <View className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                    <LogOut className="w-6 h-6" />
                  </View>
                  <Text className="text-2xl font-bold tracking-tight">Log out</Text>
                </View>
                <View className="text-sm text-red-400 font-semibold">Sign out</View>
              </button>
            </View>
          </>
        ) : (
          /* --- MAIN MENU VIEW --- */
          <>
            <View className="flex justify-end p-6">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </View>

            <View className="flex flex-col gap-2 px-8 mt-4">
              {MENU_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    onClick={async () => {
                      if (item.path === "trigger-settings") {
                        setShowSettings(true);
                        return;
                      }

                      if (item.path === "logout") {
                        await signOut();
                        navigate("/auth");
                        return;
                      }

                      if (item.path !== "#") {
                        navigate(item.path);
                      } else {
                        navigate(-1);
                      }
                    }}
                    className="flex items-center gap-6 py-5 hover:bg-muted/50 rounded-2xl px-4 transition-colors -mx-4 group"
                  >
                    <View className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                      <Icon className="w-6 h-6" />
                    </View>
                    <Text className="text-2xl font-bold tracking-tight">{item.label}</Text>
                  </button>
                );
              })}
            </View>
          </>
        )}
        
      </View>
    </View>
  );
}