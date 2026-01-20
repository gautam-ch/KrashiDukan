export const downloadCSV = (rows, headers, filename) => {
  const headerLine = headers.join(",");
  const body = rows
    .map((row) =>
      headers
        .map((h) => {
          const cell = row[h] ?? "";
          if (typeof cell === "string" && cell.includes(",")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(",")
    )
    .join("\n");

  const csv = `${headerLine}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadPrintPDF = (title, tableHtml) => {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #111; padding: 6px 8px; text-align: left; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${tableHtml}
        <script>window.print();</script>
      </body>
    </html>
  `);
  w.document.close();
};
