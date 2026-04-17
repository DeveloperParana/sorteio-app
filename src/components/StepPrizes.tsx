"use client";

import { useState } from "react";
import type { Prize } from "@/lib/types";

interface StepPrizesProps {
  participantCount: number;
  onPrizesCreated: (prizes: Prize[]) => void;
  onBack: () => void;
}

export function StepPrizes({ participantCount, onPrizesCreated, onBack }: StepPrizesProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [input, setInput] = useState("");

  const addPrize = () => {
    const name = input.trim();
    if (!name) return;
    setPrizes((prev) => [...prev, { id: crypto.randomUUID(), name }]);
    setInput("");
  };

  const removePrize = (id: string) => {
    setPrizes((prev) => prev.filter((p) => p.id !== id));
  };

  const movePrize = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= prizes.length) return;
    const updated = [...prizes];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPrizes(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addPrize();
  };

  const tooManyPrizes = prizes.length > participantCount;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">🏆 Cadastrar Prêmios</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nome do prêmio..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
        />
        <button
          onClick={addPrize}
          disabled={!input.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Adicionar
        </button>
      </div>

      {prizes.length > 0 && (
        <ul className="space-y-2">
          {prizes.map((prize, i) => (
            <li key={prize.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
              <span className="text-green-600 font-bold text-sm w-6">{i + 1}.</span>
              <span className="flex-1 text-gray-800">{prize.name}</span>
              <button onClick={() => movePrize(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg" title="Mover para cima">↑</button>
              <button onClick={() => movePrize(i, 1)} disabled={i === prizes.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg" title="Mover para baixo">↓</button>
              <button onClick={() => removePrize(prize.id)} className="text-red-400 hover:text-red-600 text-lg" title="Remover">🗑️</button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-gray-500">
        {prizes.length} prêmio{prizes.length !== 1 ? "s" : ""} para {participantCount} participantes
      </p>

      {tooManyPrizes && (
        <p className="text-amber-600 text-sm bg-amber-50 px-4 py-2 rounded-lg">
          ⚠️ Há mais prêmios do que participantes. Alguns prêmios não terão ganhador.
        </p>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">← Voltar</button>
        <button
          onClick={() => onPrizesCreated(prizes)}
          disabled={prizes.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Iniciar Sorteio →
        </button>
      </div>
    </div>
  );
}
