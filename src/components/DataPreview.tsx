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
        <thead className="bg-green-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-left font-semibold text-green-900">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, i) => (
            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
              {headers.map((h) => (
                <td key={h} className="px-4 py-2 text-gray-700">{row[h] || "—"}</td>
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
