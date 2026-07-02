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
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-left shadow-sm"
      >
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">
            {label}
          </span>
          <span className="text-foreground font-semibold text-xs leading-none truncate max-w-[90px]">
            {value}
          </span>
        </div>
        <span className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
