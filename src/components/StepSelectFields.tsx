"use client";

import { useState } from "react";
import { DataPreview } from "./DataPreview";

interface StepSelectFieldsProps {
  headers: string[];
  data: Record<string, string>[];
  onFieldsSelected: (fields: string[]) => void;
  onBack: () => void;
}

export function StepSelectFields({ headers, data, onFieldsSelected, onBack }: StepSelectFieldsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (field: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const selectedArray = headers.filter((h) => selected.has(h));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">✅ Selecionar Campos</h2>

      <p className="text-sm text-gray-500">
        Escolha quais campos deseja manter. {data.length} participantes carregados.
      </p>

      <div className="flex flex-wrap gap-2">
        {headers.map((h) => (
          <button
            key={h}
            onClick={() => toggle(h)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected.has(h)
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {selected.has(h) ? "✓ " : ""}{h}
          </button>
        ))}
      </div>

      {selectedArray.length > 0 && <DataPreview headers={selectedArray} data={data} />}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          ← Voltar
        </button>
        <button
          onClick={() => onFieldsSelected(selectedArray)}
          disabled={selectedArray.length === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
