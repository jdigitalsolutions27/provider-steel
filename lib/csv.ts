function escapeValue(value: unknown) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(rows: Record<string, unknown>[], headers: string[]) {
  const headerLine = headers.join(",");
  const lines = rows.map((row) =>
    headers.map((key) => escapeValue(row[key])).join(",")
  );
  return [headerLine, ...lines].join("\n");
}
