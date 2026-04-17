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
