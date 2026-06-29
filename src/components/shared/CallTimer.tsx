"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";

interface CallTimerProps {
  startedAt?: string;
  className?: string;
}

export function CallTimer({ startedAt, className }: CallTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  return <span className={className}>{formatDuration(elapsed)}</span>;
}
