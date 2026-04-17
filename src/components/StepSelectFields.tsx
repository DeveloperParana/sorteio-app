"use client";

import { useState, useMemo } from "react";
import { DataPreview } from "./DataPreview";
import { countDuplicates } from "@/lib/dedup";

interface StepSelectFieldsProps {
  headers: string[];
  data: Record<string, string>[];
  onFieldsSelected: (fields: string[], dedupField: string | null) => void;
  onBack: () => void;
}

export function StepSelectFields({ headers, data, onFieldsSelected, onBack }: StepSelectFieldsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dedupField, setDedupField] = useState<string | null>(null);
  const [dedupEnabled, setDedupEnabled] = useState(true);

  const toggle = (field: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  };

  const selectedArray = headers.filter((h) => selected.has(h));

  const duplicateCount = useMemo(() => {
    if (!dedupField) return 0;
    return countDuplicates(data, dedupField);
  }, [data, dedupField]);

  // Auto-detect a likely email field when fields are selected
  const suggestedDedupField = useMemo(() => {
    const emailField = selectedArray.find((f) =>
      f.toLowerCase().includes("email") || f.toLowerCase().includes("e-mail")
    );
    return emailField || (selectedArray.length > 0 ? selectedArray[0] : null);
  }, [selectedArray]);

  // Auto-set dedupField when suggestion changes and user hasn't manually picked
  useMemo(() => {
    if (suggestedDedupField && !dedupField) {
      setDedupField(suggestedDedupField);
    }
  }, [suggestedDedupField, dedupField]);

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
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {selected.has(h) ? "✓ " : ""}{h}
          </button>
        ))}
      </div>

      {selectedArray.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dedupEnabled}
                onChange={(e) => setDedupEnabled(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded accent-green-600"
              />
              <span className="text-sm font-medium text-amber-800">
                🔍 Remover duplicados
              </span>
            </label>
          </div>

          {dedupEnabled && (
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-sm text-amber-700">Campo-chave:</label>
              <select
                value={dedupField || ""}
                onChange={(e) => setDedupField(e.target.value || null)}
                className="text-sm border border-amber-300 rounded-md px-2 py-1 bg-white text-gray-700"
              >
                {selectedArray.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              {duplicateCount > 0 ? (
                <span className="text-sm font-medium text-red-600">
                  ⚠️ {duplicateCount} duplicado{duplicateCount > 1 ? "s" : ""} encontrado{duplicateCount > 1 ? "s" : ""}
                </span>
              ) : dedupField ? (
                <span className="text-sm font-medium text-green-600">
                  ✅ Nenhum duplicado encontrado
                </span>
              ) : null}
            </div>
          )}
        </div>
      )}

      {selectedArray.length > 0 && <DataPreview headers={selectedArray} data={data} />}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
          ← Voltar
        </button>
        <button
          onClick={() => onFieldsSelected(selectedArray, dedupEnabled && dedupField ? dedupField : null)}
          disabled={selectedArray.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
