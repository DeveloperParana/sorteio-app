"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Participant } from "@/lib/types";

interface SlotMachineAnimationProps {
  participants: Participant[];
  displayField: string;
  onWinnerSelected: (winner: Participant) => void;
  spinning: boolean;
}

export function SlotMachineAnimation({ participants, displayField, onWinnerSelected, spinning }: SlotMachineAnimationProps) {
  const [currentName, setCurrentName] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const winnerRef = useRef<Participant | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!spinning || participants.length === 0) return;

    cleanup();
    setIsAnimating(true);
    setShowWinner(false);

    const winnerIndex = Math.floor(Math.random() * participants.length);
    winnerRef.current = participants[winnerIndex];

    const totalSteps = 30;
    let step = 0;

    const animate = () => {
      if (step < totalSteps) {
        const randomIdx = Math.floor(Math.random() * participants.length);
        setCurrentName(participants[randomIdx][displayField] || "");
        step++;
        const delay = 80 + Math.pow(step / totalSteps, 3) * 500;
        timeoutRef.current = setTimeout(animate, delay);
      } else {
        const winner = winnerRef.current!;
        setCurrentName(winner[displayField] || "");
        setIsAnimating(false);
        setShowWinner(true);
        onWinnerSelected(winner);
      }
    };

    animate();

    return cleanup;
  }, [spinning, participants, displayField, onWinnerSelected, cleanup]);

  if (!currentName && !isAnimating) {
    return (
      <div className="text-center py-12">
        <p className="text-6xl mb-4">🎰</p>
        <p className="text-gray-400">Clique em Sortear para começar</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div
        className={`text-4xl font-bold py-8 px-4 rounded-xl transition-all duration-300 ${
          showWinner
            ? "text-green-600 bg-green-50 scale-110 border-2 border-green-300"
            : "text-gray-700 bg-gray-50"
        } ${isAnimating ? "animate-pulse" : ""}`}
      >
        {currentName}
      </div>
      {showWinner && <p className="mt-4 text-2xl animate-bounce">🎉 Parabéns! 🎉</p>}
    </div>
  );
}
