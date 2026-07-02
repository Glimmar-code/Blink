import { Search } from "lucide-react";

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Search size={32} className="mb-3 opacity-40" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
