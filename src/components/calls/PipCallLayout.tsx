"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ParticipantTile } from "./ParticipantTile";
import { CURRENT_USER_ID } from "@/lib/seed-data";
import type { CallParticipant } from "@/types";

const PIP_W = 120;
const PIP_H = 160; // 3:4 aspect ratio
const MARGIN = 16;

interface PipCallLayoutProps {
  participants: CallParticipant[];
}

export function PipCallLayout({ participants }: PipCallLayoutProps) {
  const me = participants.find((p) => p.userId === CURRENT_USER_ID) ?? participants[0];
  const other = participants.find((p) => p.userId !== CURRENT_USER_ID) ?? participants[1];

  const [swapped, setSwapped] = useState(false);
  const [pipPos, setPipPos] = useState({ x: 0, y: MARGIN });
  const [isSnapping, setIsSnapping] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pipPosRef = useRef(pipPos);
  const dragStartRef = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);
  const hasMovedRef = useRef(false);

  // Keep ref in sync with state so pointer handlers always see latest value
  useEffect(() => { pipPosRef.current = pipPos; }, [pipPos]);

  // Initialize PiP at top-right corner after mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width } = el.getBoundingClientRect();
    const initial = { x: width - PIP_W - MARGIN, y: MARGIN };
    setPipPos(initial);
    pipPosRef.current = initial;
  }, []);

  const getCorners = useCallback(() => {
    const el = containerRef.current;
    if (!el) return null;
    const { width, height } = el.getBoundingClientRect();
    return {
      tl: { x: MARGIN, y: MARGIN },
      tr: { x: width - PIP_W - MARGIN, y: MARGIN },
      bl: { x: MARGIN, y: height - PIP_H - MARGIN },
      br: { x: width - PIP_W - MARGIN, y: height - PIP_H - MARGIN },
    };
  }, []);

  const snapToNearest = useCallback((currentX: number, currentY: number) => {
    const corners = getCorners();
    if (!corners) return;
    let nearest = corners.tr;
    let minDist = Infinity;
    for (const corner of Object.values(corners)) {
      const d = Math.hypot(currentX - corner.x, currentY - corner.y);
      if (d < minDist) { minDist = d; nearest = corner; }
    }
    setIsSnapping(true);
    setPipPos(nearest);
    setTimeout(() => setIsSnapping(false), 310);
  }, [getCorners]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = {
      px: e.clientX,
      py: e.clientY,
      ox: pipPosRef.current.x,
      oy: pipPosRef.current.y,
    };
    hasMovedRef.current = false;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.px;
    const dy = e.clientY - dragStartRef.current.py;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
      const el = containerRef.current;
      const { width, height } = el?.getBoundingClientRect() ?? { width: 400, height: 700 };
      const newPos = {
        x: Math.max(0, Math.min(width - PIP_W, dragStartRef.current.ox + dx)),
        y: Math.max(0, Math.min(height - PIP_H, dragStartRef.current.oy + dy)),
      };
      setPipPos(newPos);
      pipPosRef.current = newPos;
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    if (hasMovedRef.current) {
      const dx = e.clientX - dragStartRef.current.px;
      const dy = e.clientY - dragStartRef.current.py;
      snapToNearest(dragStartRef.current.ox + dx, dragStartRef.current.oy + dy);
    } else {
      // Tap without drag: swap foreground and PiP
      setSwapped((s) => !s);
    }
    dragStartRef.current = null;
    hasMovedRef.current = false;
  }, [snapToNearest]);

  if (!me || !other) return null;

  const fullscreen = swapped ? other : me;
  const pip = swapped ? me : other;

  return (
    <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden bg-slate-900">
      {/* Full-screen background tile */}
      <ParticipantTile participant={fullscreen} className="absolute inset-0 h-full w-full rounded-none" />

      {/* PiP tile — draggable, snaps to corners, tap to swap */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="absolute top-0 left-0 cursor-pointer touch-none select-none"
        style={{
          width: PIP_W,
          height: PIP_H,
          transform: `translate3d(${pipPos.x}px, ${pipPos.y}px, 0)`,
          transition: isSnapping ? "transform 0.3s ease-out" : "none",
        }}
      >
        <ParticipantTile
          participant={pip}
          className="h-full w-full rounded-(--radius-lg) shadow-xl ring-2 ring-white/30"
        />
      </div>
    </div>
  );
}
