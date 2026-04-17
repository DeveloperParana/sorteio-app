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
        <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
      </label>
    </div>
  );
}
