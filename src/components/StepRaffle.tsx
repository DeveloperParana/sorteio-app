"use client";

import { useState, useCallback } from "react";
import { SlotMachineAnimation } from "./SlotMachineAnimation";
import type { Participant, Prize } from "@/lib/types";

interface StepRaffleProps {
  participants: Participant[];
  prizes: Prize[];
  displayField: string;
}

export function StepRaffle({ participants, prizes, displayField }: StepRaffleProps) {
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [remaining, setRemaining] = useState<Participant[]>(participants);
  const [results, setResults] = useState<Prize[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);

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

  if (isFinished) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center">🎊 Sorteio Completo!</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-indigo-900">Prêmio</th>
                <th className="px-4 py-3 text-left font-semibold text-indigo-900">Ganhador</th>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 text-center">🎯 Sorteio</h2>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">Prêmio {currentPrizeIndex + 1} de {prizes.length}</p>
        <p className="text-2xl font-bold text-indigo-700">🏆 {currentPrize.name}</p>
        <p className="text-xs text-gray-400 mt-1">{remaining.length} participantes restantes</p>
      </div>

      <SlotMachineAnimation
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
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
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
