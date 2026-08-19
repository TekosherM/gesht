import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T12:00:00`) : undefined;
  const start = min ? new Date(`${min}T12:00:00`) : new Date();

  return (
    <div className="relative">
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-md bg-surface px-3 text-left text-sm shadow-border",
        )}
      >
        <CalendarDays className="size-4 text-muted" />
        <span>{selected ? format(selected, "EEE d MMM") : "Choose date"}</span>
      </button>
      {open ? (
        <div className="absolute z-30 mt-2 rounded-lg bg-surface p-3 shadow-lift">
          <DayPicker
            mode="single"
            selected={selected}
            disabled={{ before: start }}
            onSelect={(d) => {
              if (!d) return;
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }}
          />
          <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      ) : null}
    </div>
  );
}
