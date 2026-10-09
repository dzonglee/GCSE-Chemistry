"use client";
import { useEffect, useState } from "react";

export function PaperClock({
  started,
  minutes,
}: {
  started: number;
  minutes: number;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (now === null) return <span>Loading practice timer…</span>;
  const remaining = started + minutes * 60000 - now;
  const seconds = Math.ceil(Math.abs(remaining) / 1000);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  return (
    <span className="paper-clock">
      {remaining > 0 ? `${clock} remaining` : `Time overrun ${clock}`}
      <span className="sr-only">
        . Practice timer; submit the whole paper yourself. Your work is
        retained.
      </span>
    </span>
  );
}
