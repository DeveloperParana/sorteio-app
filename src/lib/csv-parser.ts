import Papa from "papaparse";

export interface ParseResult {
  headers: string[];
  data: Record<string, string>[];
  errors: string[];
}

export function parseCSVText(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  });

  return {
    headers: result.meta.fields || [],
    data: result.data,
    errors: result.errors.map((e) => e.message),
  };
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsText(file, "UTF-8");
  });
}
