"use client";

import { useState } from "react";
import { FileDropZone } from "./FileDropZone";
import { DataPreview } from "./DataPreview";
import { parseCSVText, readFileAsText } from "@/lib/csv-parser";
import { isGoogleSheetsUrl } from "@/lib/sheets-url";

interface StepImportProps {
  onDataLoaded: (headers: string[], data: Record<string, string>[]) => void;
}

export function StepImport({ onDataLoaded }: StepImportProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [hasData, setHasData] = useState(false);

  const loadCSV = (csvText: string) => {
    const result = parseCSVText(csvText);
    if (result.headers.length === 0 || result.data.length === 0) {
      setError("Arquivo CSV vazio ou sem dados válidos.");
      return;
    }
    setHeaders(result.headers);
    setData(result.data);
    setHasData(true);
    setError("");
  };

  const handleFile = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const text = await readFileAsText(file);
      loadCSV(text);
    } catch {
      setError("Erro ao ler o arquivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSheetsUrl = async () => {
    if (!sheetsUrl.trim()) return;
    if (!isGoogleSheetsUrl(sheetsUrl)) {
      setError("URL inválida. Cole uma URL do Google Sheets.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/fetch-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetsUrl }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erro ao buscar planilha.");
        return;
      }
      loadCSV(json.csv);
    } catch {
      setError("Erro ao buscar planilha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">📥 Importar Dados</h2>

      <FileDropZone onFileSelected={handleFile} />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">ou cole uma URL</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={sheetsUrl}
          onChange={(e) => setSheetsUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={handleSheetsUrl}
          disabled={loading || !sheetsUrl.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {loading ? "Carregando..." : "Buscar"}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">⚠️ {error}</p>
      )}

      {hasData && (
        <>
          <DataPreview headers={headers} data={data} />
          <div className="flex justify-end">
            <button
              onClick={() => onDataLoaded(headers, data)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Próximo →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
