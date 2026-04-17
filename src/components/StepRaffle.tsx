"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { SlotMachineAnimation } from "./SlotMachineAnimation";
import type { Participant, Prize } from "@/lib/types";

const RAFFLE_KEY = "sorteio-app:raffle";

interface RaffleState {
  currentPrizeIndex: number;
  remaining: Participant[];
  results: Prize[];
}

interface StepRaffleProps {
  participants: Participant[];
  prizes: Prize[];
  displayField: string;
  onNewRaffle: () => void;
}

export function StepRaffle({ participants, prizes, displayField, onNewRaffle }: StepRaffleProps) {
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [remaining, setRemaining] = useState<Participant[]>(participants);
  const [results, setResults] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const hydrated = useRef(false);

  // Restore state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RAFFLE_KEY);
      if (stored) {
        const state: RaffleState = JSON.parse(stored);
        setCurrentPrizeIndex(state.currentPrizeIndex);
        setRemaining(state.remaining);
        setResults(state.results);
        if (state.results.length > 0 && state.currentPrizeIndex < prizes.length) {
          setShowResult(true);
        }
      }
    } catch { /* ignore */ }
    hydrated.current = true;
  }, [prizes.length]);

  // Save state to localStorage on changes
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      const state: RaffleState = { currentPrizeIndex, remaining, results };
      localStorage.setItem(RAFFLE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [currentPrizeIndex, remaining, results]);

  const currentPrize = prizes[currentPrizeIndex];
  const isFinished = currentPrizeIndex >= prizes.length;

  const handleSpin = () => {
    if (remaining.length === 0 || spinning) return;
    setSpinning(true);
    setShowResult(false);
  };

  const handleWinnerSelected = useCallback(
    (winner: Participant) => {
      setSpinning(false);
      setShowResult(true);
      setRemaining((prev) => prev.filter((p) => p !== winner));
      setResults((prev) => [...prev, { ...currentPrize, winner }]);
    },
    [currentPrize]
  );

  const handleNextPrize = () => {
    setCurrentPrizeIndex((prev) => prev + 1);
    setShowResult(false);
  };

  const handleNewRaffle = () => {
    try { localStorage.removeItem(RAFFLE_KEY); } catch { /* ignore */ }
    onNewRaffle();
  };

  if (isFinished) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center">🎊 Sorteio Completo!</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-green-900">Prêmio</th>
                <th className="px-4 py-3 text-left font-semibold text-green-900">Ganhador</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">🏆 {r.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.winner ? Object.values(r.winner).join(" — ") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center pt-4">
          <button
            onClick={handleNewRaffle}
            className="px-6 py-2 border-2 border-green-600 text-green-700 rounded-xl hover:bg-green-50 transition-colors font-medium"
          >
            🔄 Novo Sorteio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 text-center">🎯 Sorteio</h2>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">Prêmio {currentPrizeIndex + 1} de {prizes.length}</p>
        <p className="text-2xl font-bold text-green-700">🏆 {currentPrize.name}</p>
        <p className="text-xs text-gray-400 mt-1">{remaining.length} participantes restantes</p>
      </div>

      <SlotMachineAnimation
        key={currentPrizeIndex}
        participants={remaining}
        displayField={displayField}
        onWinnerSelected={handleWinnerSelected}
        spinning={spinning}
      />

      <div className="flex justify-center gap-4">
        {!showResult ? (
          <button
            onClick={handleSpin}
            disabled={spinning || remaining.length === 0}
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            {spinning ? "Sorteando..." : "🎲 Sortear!"}
          </button>
        ) : (
          <button
            onClick={handleNextPrize}
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Próximo Prêmio →
          </button>
        )}
      </div>
    </div>
  );
}
