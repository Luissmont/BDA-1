import { notFound } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/db';
import { z } from 'zod';
import ReportTable from '@/components/ReportTable';

const searchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  query: z.string().optional().default(''),
});

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ReportPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const reportId = parseInt(params.id);
  const { page, query } = searchSchema.parse(searchParams);
  
  const ITEMS_PER_PAGE = 10;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  let sql = '';
  let sqlParams: any[] = [];
  let title = '';
  let showSearch = false;
  let showPagination = false;

  switch (reportId) {
    case 1: 
      title = 'Rendimiento de Categorías';
      sql = 'SELECT * FROM v_categoria_rendimiento ORDER BY valor_inventario DESC';
      break;
    case 2: 
      title = 'Clientes VIP (Filtro por Nombre)';
      showSearch = true;
      sql = `SELECT * FROM v_clientes_vip WHERE cliente ILIKE $1 ORDER BY total_gastado DESC`;
      sqlParams = [`%${query}%`];
      break;
    case 3: 
      title = 'Análisis de Stock Crítico';
      sql = 'SELECT * FROM v_analisis_productos ORDER BY ratio_precio_mercado ASC';
      break;
    case 4: 
      title = 'Tendencias de Ventas (Paginado)';
      showPagination = true;
      sql = `SELECT * FROM v_tendencias_ventas ORDER BY mes DESC LIMIT $1 OFFSET $2`;
      sqlParams = [ITEMS_PER_PAGE, offset];
      break;
    case 5: 
      title = 'Detalle de Órdenes';
      showSearch = true;
      showPagination = true;
      if (query) {
        sql = `SELECT * FROM v_detalle_ordenes_completo WHERE contacto_cliente ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        sqlParams = [`%${query}%`, ITEMS_PER_PAGE, offset];
      } else {
        sql = `SELECT * FROM v_detalle_ordenes_completo ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        sqlParams = [ITEMS_PER_PAGE, offset];
      }
      break;
    default:
      notFound();
  }

  let data = [];
  try {
    const result = await pool.query(sql, sqlParams);
    data = result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    return <div style={{color: 'red', padding: 20}}>Error de conexión a la base de datos.</div>;
  }

  return (
    <main className="container">
      <Link href="/" className="link-volver">  REGRESAR A DASHBOARD</Link>
      
      <h1>Reporte: {title}</h1>

      {showSearch && (
        <form className="formulario-busqueda">
          <label>Buscar: </label>
          <input 
            name="query"
            defaultValue={query}
            className="input-busqueda"
          />
          <button type="submit" className="boton" style={{marginLeft: 10}}>Filtrar</button>
        </form>
      )}

      <ReportTable rows={data} />

      {showPagination && (
        <div className="paginacion">
           {page > 1 && (
             <Link href={`/reports/${reportId}?page=${page - 1}&query=${query}`} className="boton">Ant.</Link>
           )}
           <span>Página {page}</span>
           {data.length === ITEMS_PER_PAGE && (
             <Link href={`/reports/${reportId}?page=${page + 1}&query=${query}`} className="boton">Sig.</Link>
           )}
        </div>
      )}
    </main>
  );
}