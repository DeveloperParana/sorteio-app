# Sorteio App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js raffle app that imports CSV data (upload or Google Sheets URL), lets users select fields and create prizes, then draws winners with slot-machine animation.

**Architecture:** Single-page wizard (4 steps) with all state in React useState. No database — session-only. API route proxies Google Sheets CSV export to avoid CORS.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, papaparse, Jest + React Testing Library

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                  (modify - metadata + font)
│   ├── page.tsx                    (rewrite - wizard state management)
│   ├── globals.css                 (modify - add slot machine animation)
│   └── api/
│       └── fetch-csv/
│           └── route.ts            (create - Google Sheets proxy)
├── lib/
│   ├── types.ts                    (create - TypeScript types)
│   ├── csv-parser.ts               (create - CSV parsing with papaparse)
│   └── sheets-url.ts               (create - Google Sheets URL conversion)
├── components/
│   ├── Wizard.tsx                  (create - progress bar + step container)
│   ├── StepImport.tsx              (create - step 1: upload + URL)
│   ├── StepSelectFields.tsx        (create - step 2: field checkboxes)
│   ├── StepPrizes.tsx              (create - step 3: prize CRUD)
│   ├── StepRaffle.tsx              (create - step 4: raffle + results)
│   ├── FileDropZone.tsx            (create - drag & drop area)
│   ├── DataPreview.tsx             (create - CSV table preview)
│   └── SlotMachineAnimation.tsx    (create - spinning names animation)
└── __tests__/
    └── lib/
        ├── csv-parser.test.ts      (create - CSV parser unit tests)
        └── sheets-url.test.ts      (create - URL utility unit tests)
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: Next.js project in current directory
- Modify: `package.json` (add test script + dependencies)
- Create: `jest.config.ts`, `jest.setup.ts`

- [ ] **Step 1: Scaffold Next.js project**

```bash
cd /Users/luizschons/Documents/codes/little-tiger-v2
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

If it fails due to non-empty directory, temporarily move docs:
```bash
mv docs /tmp/sorteio-docs-backup
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
mv /tmp/sorteio-docs-backup docs
```

- [ ] **Step 2: Install dependencies**

```bash
npm install papaparse
npm install -D @types/papaparse jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-node
```

- [ ] **Step 3: Configure Jest**

Create `jest.config.ts`:

```typescript
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  testPathPattern: ["<rootDir>/src/__tests__/"],
};

export default createJestConfig(config);
```

Create `jest.setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

Add to `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Verify setup**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind + Jest

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Core Types + Utility Functions

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/csv-parser.ts`
- Create: `src/lib/sheets-url.ts`
- Create: `src/__tests__/lib/csv-parser.test.ts`
- Create: `src/__tests__/lib/sheets-url.test.ts`

**Depends on:** Task 1

- [ ] **Step 1: Create types**

Create `src/lib/types.ts`:

```typescript
export type Participant = Record<string, string>;

export interface Prize {
  id: string;
  name: string;
  winner?: Participant;
}
```

- [ ] **Step 2: Write CSV parser tests**

Create `src/__tests__/lib/csv-parser.test.ts`:

```typescript
import { parseCSVText } from "@/lib/csv-parser";

describe("parseCSVText", () => {
  it("parses CSV with headers", () => {
    const csv = "nome,email\nJoão,joao@test.com\nMaria,maria@test.com";
    const result = parseCSVText(csv);

    expect(result.headers).toEqual(["nome", "email"]);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ nome: "João", email: "joao@test.com" });
    expect(result.data[1]).toEqual({ nome: "Maria", email: "maria@test.com" });
    expect(result.errors).toHaveLength(0);
  });

  it("trims header whitespace", () => {
    const csv = " nome , email \nJoão,joao@test.com";
    const result = parseCSVText(csv);

    expect(result.headers).toEqual(["nome", "email"]);
  });

  it("skips empty lines", () => {
    const csv = "nome,email\nJoão,joao@test.com\n\n\nMaria,maria@test.com\n";
    const result = parseCSVText(csv);

    expect(result.data).toHaveLength(2);
  });

  it("handles semicolon delimiter", () => {
    const csv = "nome;email\nJoão;joao@test.com";
    const result = parseCSVText(csv);

    expect(result.headers).toEqual(["nome", "email"]);
    expect(result.data[0]).toEqual({ nome: "João", email: "joao@test.com" });
  });

  it("returns errors for malformed CSV", () => {
    const csv = "";
    const result = parseCSVText(csv);

    expect(result.data).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
npx jest src/__tests__/lib/csv-parser.test.ts --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement CSV parser**

Create `src/lib/csv-parser.ts`:

```typescript
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
```

- [ ] **Step 5: Run CSV parser tests**

```bash
npx jest src/__tests__/lib/csv-parser.test.ts --no-cache
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Write Sheets URL tests**

Create `src/__tests__/lib/sheets-url.test.ts`:

```typescript
import { isGoogleSheetsUrl, toExportUrl } from "@/lib/sheets-url";

describe("isGoogleSheetsUrl", () => {
  it("accepts valid Google Sheets URLs", () => {
    expect(
      isGoogleSheetsUrl(
        "https://docs.google.com/spreadsheets/d/abc123/edit"
      )
    ).toBe(true);
  });

  it("rejects non-Sheets URLs", () => {
    expect(isGoogleSheetsUrl("https://example.com")).toBe(false);
    expect(isGoogleSheetsUrl("not a url")).toBe(false);
  });
});

describe("toExportUrl", () => {
  it("converts edit URL to CSV export URL", () => {
    const url =
      "https://docs.google.com/spreadsheets/d/abc123/edit#gid=0";
    const result = toExportUrl(url);
    expect(result).toBe(
      "https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=0"
    );
  });

  it("defaults to gid=0 when not specified", () => {
    const url = "https://docs.google.com/spreadsheets/d/abc123/edit";
    const result = toExportUrl(url);
    expect(result).toContain("gid=0");
  });

  it("throws on invalid URL", () => {
    expect(() => toExportUrl("https://example.com")).toThrow();
  });
});
```

- [ ] **Step 7: Run Sheets URL tests to verify they fail**

```bash
npx jest src/__tests__/lib/sheets-url.test.ts --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 8: Implement Sheets URL utility**

Create `src/lib/sheets-url.ts`:

```typescript
export function isGoogleSheetsUrl(url: string): boolean {
  return /^https:\/\/docs\.google\.com\/spreadsheets\/d\//.test(url);
}

export function toExportUrl(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) throw new Error("URL inválida do Google Sheets");
  const id = match[1];
  const gidMatch = url.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}
```

- [ ] **Step 9: Run all tests**

```bash
npx jest --no-cache
```

Expected: All tests PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add types, CSV parser, and Sheets URL utilities

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: API Route for Google Sheets Proxy

**Files:**
- Create: `src/app/api/fetch-csv/route.ts`

**Depends on:** Task 2

- [ ] **Step 1: Create API route**

Create `src/app/api/fetch-csv/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { isGoogleSheetsUrl, toExportUrl } from "@/lib/sheets-url";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !isGoogleSheetsUrl(url)) {
      return NextResponse.json(
        { error: "URL inválida. Use uma URL do Google Sheets." },
        { status: 400 }
      );
    }

    const exportUrl = toExportUrl(url);
    const response = await fetch(exportUrl, { next: { revalidate: 0 } });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Não foi possível acessar a planilha. Verifique se ela está publicada na web.",
        },
        { status: 400 }
      );
    }

    const csvText = await response.text();
    return NextResponse.json({ csv: csvText });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar planilha." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add API route for Google Sheets CSV proxy

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: DataPreview + FileDropZone Components

**Files:**
- Create: `src/components/DataPreview.tsx`
- Create: `src/components/FileDropZone.tsx`

**Depends on:** Task 1

- [ ] **Step 1: Create DataPreview component**

Create `src/components/DataPreview.tsx`:

```tsx
interface DataPreviewProps {
  headers: string[];
  data: Record<string, string>[];
  maxRows?: number;
}

export function DataPreview({ headers, data, maxRows = 5 }: DataPreviewProps) {
  const displayData = data.slice(0, maxRows);

  if (headers.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-indigo-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left font-semibold text-indigo-900"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              {headers.map((h) => (
                <td key={h} className="px-4 py-2 text-gray-700">
                  {row[h] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > maxRows && (
        <p className="px-4 py-2 text-xs text-gray-400 bg-gray-50">
          Mostrando {maxRows} de {data.length} linhas
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create FileDropZone component**

Create `src/components/FileDropZone.tsx`:

```tsx
"use client";

import { useCallback, useState, type DragEvent, type ChangeEvent } from "react";

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
}

export function FileDropZone({ onFileSelected }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleFileInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDragging
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"
      }`}
    >
      <div className="text-4xl mb-3">📄</div>
      <p className="text-gray-600 mb-2">
        Arraste um arquivo <strong>.csv</strong> aqui
      </p>
      <p className="text-gray-400 text-sm mb-4">ou</p>
      <label className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
        Escolher arquivo
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add DataPreview and FileDropZone components

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: StepImport Component (Step 1)

**Files:**
- Create: `src/components/StepImport.tsx`

**Depends on:** Tasks 2, 3, 4

- [ ] **Step 1: Create StepImport component**

Create `src/components/StepImport.tsx`:

```tsx
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
      <h2 className="text-xl font-semibold text-gray-800">
        📥 Importar Dados
      </h2>

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
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
          ⚠️ {error}
        </p>
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add StepImport component (CSV upload + Google Sheets URL)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 6: StepSelectFields Component (Step 2)

**Files:**
- Create: `src/components/StepSelectFields.tsx`

**Depends on:** Task 4

- [ ] **Step 1: Create StepSelectFields component**

Create `src/components/StepSelectFields.tsx`:

```tsx
"use client";

import { useState } from "react";
import { DataPreview } from "./DataPreview";

interface StepSelectFieldsProps {
  headers: string[];
  data: Record<string, string>[];
  onFieldsSelected: (fields: string[]) => void;
  onBack: () => void;
}

export function StepSelectFields({
  headers,
  data,
  onFieldsSelected,
  onBack,
}: StepSelectFieldsProps) {
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
      <h2 className="text-xl font-semibold text-gray-800">
        ✅ Selecionar Campos
      </h2>

      <p className="text-sm text-gray-500">
        Escolha quais campos deseja manter. {data.length} participantes
        carregados.
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
            {selected.has(h) ? "✓ " : ""}
            {h}
          </button>
        ))}
      </div>

      {selectedArray.length > 0 && (
        <DataPreview headers={selectedArray} data={data} />
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add StepSelectFields component (field checkboxes + preview)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 7: StepPrizes Component (Step 3)

**Files:**
- Create: `src/components/StepPrizes.tsx`

**Depends on:** Task 1

- [ ] **Step 1: Create StepPrizes component**

Create `src/components/StepPrizes.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Prize } from "@/lib/types";

interface StepPrizesProps {
  participantCount: number;
  onPrizesCreated: (prizes: Prize[]) => void;
  onBack: () => void;
}

export function StepPrizes({
  participantCount,
  onPrizesCreated,
  onBack,
}: StepPrizesProps) {
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
      <h2 className="text-xl font-semibold text-gray-800">
        🏆 Cadastrar Prêmios
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nome do prêmio..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={addPrize}
          disabled={!input.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Adicionar
        </button>
      </div>

      {prizes.length > 0 && (
        <ul className="space-y-2">
          {prizes.map((prize, i) => (
            <li
              key={prize.id}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2"
            >
              <span className="text-indigo-600 font-bold text-sm w-6">
                {i + 1}.
              </span>
              <span className="flex-1 text-gray-800">{prize.name}</span>
              <button
                onClick={() => movePrize(i, -1)}
                disabled={i === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg"
                title="Mover para cima"
              >
                ↑
              </button>
              <button
                onClick={() => movePrize(i, 1)}
                disabled={i === prizes.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 text-lg"
                title="Mover para baixo"
              >
                ↓
              </button>
              <button
                onClick={() => removePrize(prize.id)}
                className="text-red-400 hover:text-red-600 text-lg"
                title="Remover"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-gray-500">
        {prizes.length} prêmio{prizes.length !== 1 ? "s" : ""} para{" "}
        {participantCount} participantes
      </p>

      {tooManyPrizes && (
        <p className="text-amber-600 text-sm bg-amber-50 px-4 py-2 rounded-lg">
          ⚠️ Há mais prêmios do que participantes. Alguns prêmios não terão
          ganhador.
        </p>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={() => onPrizesCreated(prizes)}
          disabled={prizes.length === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Iniciar Sorteio →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add StepPrizes component (prize CRUD with reorder)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 8: SlotMachineAnimation + StepRaffle (Step 4)

**Files:**
- Create: `src/components/SlotMachineAnimation.tsx`
- Create: `src/components/StepRaffle.tsx`

**Depends on:** Task 2

- [ ] **Step 1: Create SlotMachineAnimation component**

Create `src/components/SlotMachineAnimation.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Participant } from "@/lib/types";

interface SlotMachineAnimationProps {
  participants: Participant[];
  displayField: string;
  onWinnerSelected: (winner: Participant) => void;
  spinning: boolean;
}

export function SlotMachineAnimation({
  participants,
  displayField,
  onWinnerSelected,
  spinning,
}: SlotMachineAnimationProps) {
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
            ? "text-indigo-600 bg-indigo-50 scale-110 border-2 border-indigo-300"
            : "text-gray-700 bg-gray-50"
        } ${isAnimating ? "animate-pulse" : ""}`}
      >
        {currentName}
      </div>
      {showWinner && (
        <p className="mt-4 text-2xl animate-bounce">🎉 Parabéns! 🎉</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create StepRaffle component**

Create `src/components/StepRaffle.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { SlotMachineAnimation } from "./SlotMachineAnimation";
import type { Participant, Prize } from "@/lib/types";

interface StepRaffleProps {
  participants: Participant[];
  prizes: Prize[];
  displayField: string;
}

export function StepRaffle({
  participants,
  prizes,
  displayField,
}: StepRaffleProps) {
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
      setResults((prev) => [
        ...prev,
        { ...currentPrize, winner },
      ]);
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
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          🎊 Sorteio Completo!
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-indigo-900">
                  Prêmio
                </th>
                <th className="px-4 py-3 text-left font-semibold text-indigo-900">
                  Ganhador
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    🏆 {r.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.winner
                      ? Object.values(r.winner).join(" — ")
                      : "—"}
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
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        🎯 Sorteio
      </h2>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">
          Prêmio {currentPrizeIndex + 1} de {prizes.length}
        </p>
        <p className="text-2xl font-bold text-indigo-700">
          🏆 {currentPrize.name}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {remaining.length} participantes restantes
        </p>
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
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add SlotMachineAnimation and StepRaffle components

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 9: Wizard + Main Page + Layout

**Files:**
- Create: `src/components/Wizard.tsx`
- Rewrite: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Depends on:** Tasks 5, 6, 7, 8

- [ ] **Step 1: Create Wizard component**

Create `src/components/Wizard.tsx`:

```tsx
interface WizardProps {
  currentStep: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

const STEP_LABELS = ["Importar", "Campos", "Prêmios", "Sortear"];

export function Wizard({ currentStep, children }: WizardProps) {
  return (
    <div className="space-y-8">
      <nav className="flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3 | 4;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : isDone
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs bg-white/20">
                  {isDone ? "✓" : stepNum}
                </span>
                {label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    isDone ? "bg-indigo-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite page.tsx**

Replace the contents of `src/app/page.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { Wizard } from "@/components/Wizard";
import { StepImport } from "@/components/StepImport";
import { StepSelectFields } from "@/components/StepSelectFields";
import { StepPrizes } from "@/components/StepPrizes";
import { StepRaffle } from "@/components/StepRaffle";
import type { Participant, Prize } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  const handleDataLoaded = (h: string[], data: Record<string, string>[]) => {
    setHeaders(h);
    setRawData(data);
    setStep(2);
  };

  const handleFieldsSelected = (fields: string[]) => {
    setSelectedFields(fields);
    const filtered = rawData.map((row) => {
      const obj: Record<string, string> = {};
      fields.forEach((f) => {
        obj[f] = row[f];
      });
      return obj;
    });
    setParticipants(filtered);
    setStep(3);
  };

  const handlePrizesCreated = (p: Prize[]) => {
    setPrizes(p);
    setStep(4);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
          🎯 Sorteio App
        </h1>
        <Wizard currentStep={step}>
          {step === 1 && <StepImport onDataLoaded={handleDataLoaded} />}
          {step === 2 && (
            <StepSelectFields
              headers={headers}
              data={rawData}
              onFieldsSelected={handleFieldsSelected}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepPrizes
              participantCount={participants.length}
              onPrizesCreated={handlePrizesCreated}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepRaffle
              participants={participants}
              prizes={prizes}
              displayField={selectedFields[0]}
            />
          )}
        </Wizard>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Update layout.tsx metadata**

In `src/app/layout.tsx`, update the metadata object:

```typescript
export const metadata: Metadata = {
  title: "Sorteio App",
  description: "App de sorteio com CSV — importe dados, crie prêmios, sorteie ganhadores!",
};
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Wizard component and wire up main page

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

- [ ] **Step 6: Run dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000` — should see the wizard with Step 1 (import).

- [ ] **Step 7: Push to GitHub**

```bash
git push origin main
```

