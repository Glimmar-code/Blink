import { View, Text } from "react-native";
import { useState } from "react";

export function Dropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-left shadow-sm"
      >
        <View className="flex flex-col">
          <Text className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">
            {label}
          </Text>
          <Text className="text-foreground font-semibold text-xs leading-none truncate max-w-[90px]">
            {value}
          </Text>
        </View>
        <Text className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>⌄</Text>
      </button>
      {open && (
        <View className="absolute top-full left-0 mt-1 w-full bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm ${value === opt ? "bg-foreground text-background font-semibold" : "text-foreground hover:bg-muted"}`}
            >
              {opt}
            </button>
          ))}
        </View>
      )}
    </View>
  );
}
