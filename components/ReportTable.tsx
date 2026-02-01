export default function ReportTable({ rows }: { rows: any[] }) {
  if (rows.length === 0) {
    return <div style={{padding: 20, fontStyle: 'italic', color: '#666'}}>No se encontraron resultados.</div>;
  }

  const headers = Object.keys(rows[0]);

  return (
    <div className="tabla-contenedor">
      <table className="tabla-reporte">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>
                {header.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={`${index}-${header}`}>
                  {renderCell(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(value: any) {
  if (value === null) return '-';
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return `$${value.toFixed(2)}`;
  }
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  return value;
}