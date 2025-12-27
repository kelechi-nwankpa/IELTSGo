'use client';

import { useEffect, useState, useRef } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
  duration?: number;
  pieceCount?: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function ConfettiCelebration({
  trigger,
  onComplete,
  duration = 3000,
  pieceCount = 100,
}: ConfettiCelebrationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const lastTriggerRef = useRef(false);

  useEffect(() => {
    // Only trigger when going from false to true
    if (trigger && !lastTriggerRef.current) {
      lastTriggerRef.current = true;

      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
      }));

      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: trigger animation on prop change
      setPieces(newPieces);

      // Clean up after animation
      const timer = setTimeout(() => {
        setPieces([]);
        lastTriggerRef.current = false;
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }

    if (!trigger) {
      lastTriggerRef.current = false;
    }
  }, [trigger, duration, pieceCount, onComplete]);

  if (pieces.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="animate-confetti absolute"
          style={{
            left: `${piece.x}%`,
            top: '-10px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          <div
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
