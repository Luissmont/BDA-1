import { notFound } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import ReportTable from '@/components/ReportTable';
import '../reports.css';
import {
  getCategoriaRendimiento,
  getClientesVIP,
  getAnalisisProductos,
  getTendenciasVentas,
  getDetalleOrdenes,
} from '@/lib/actions';
import type {
  CategoriaRendimiento,
  ClienteVIP,
  AnalisisProducto,
  TendenciaVenta,
  DetalleOrden,
  ReportData,
} from '@/lib/types';

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

  let data: ReportData[] = [];
  let title = '';
  let description = '';
  let showSearch = false;
  let showPagination = false;

  try {
    switch (reportId) {
      case 1:
        title = 'Rendimiento de Categorías';
        description = 'Análisis de inventario y valor monetario por categoría de productos';
        data = await getCategoriaRendimiento();
        break;

      case 2:
        title = 'Clientes VIP (Filtro por Nombre)';
        description = 'Clasificación de clientes según su nivel de compras';
        showSearch = true;
        data = await getClientesVIP(query || undefined);
        break;

      case 3:
        title = 'Análisis de Stock Crítico';
        description = 'Estado de inventario y comparación de precios con el mercado';
        data = await getAnalisisProductos();
        break;

      case 4:
        title = 'Tendencias de Ventas (Paginado)';
        description = 'Evolución mensual de ventas con acumulado anual';
        showPagination = true;
        data = await getTendenciasVentas(page, ITEMS_PER_PAGE);
        break;

      case 5:
        title = 'Detalle de Órdenes';
        description = 'Auditoría completa de pedidos con información de contacto';
        showSearch = true;
        showPagination = true;
        data = await getDetalleOrdenes(page, ITEMS_PER_PAGE, query || undefined);
        break;

      default:
        notFound();
    }
  } catch (error) {
    console.error('Database Error:', error);
    return <div style={{ color: 'red', padding: 20 }}>Error de conexión a la base de datos.</div>;
  }

  const renderKPIs = () => {
    if (data.length === 0) return null;

    switch (reportId) {
      case 1:
        const categoriasData = data as CategoriaRendimiento[];
        const totalInventoryValue = categoriasData.reduce(
          (sum, row) => sum + parseFloat(row.valor_inventario || '0'),
          0
        );
        const totalProducts = categoriasData.reduce(
          (sum, row) => sum + row.total_productos,
          0
        );
        return (
          <div className="kpi-container">
            <div className="kpi-card">
              <div className="kpi-valor">${totalInventoryValue.toFixed(2)}</div>
              <div className="kpi-label">Valor Total Inventario</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">{totalProducts}</div>
              <div className="kpi-label">Total Productos</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">{data.length}</div>
              <div className="kpi-label">Categorías Activas</div>
            </div>
          </div>
        );

      case 2:
        const clientesData = data as ClienteVIP[];
        const platinumClients = clientesData.filter(row => row.nivel_cliente === 'Platinum').length;
        const totalSpent = clientesData.reduce(
          (sum, row) => sum + parseFloat(row.total_gastado || '0'),
          0
        );
        const avgSpent = data.length > 0 ? totalSpent / data.length : 0;
        return (
          <div className="kpi-container">
            <div className="kpi-card">
              <div className="kpi-valor">{platinumClients}</div>
              <div className="kpi-label">Clientes Platinum</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">${totalSpent.toFixed(2)}</div>
              <div className="kpi-label">Total Gastado</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">${avgSpent.toFixed(2)}</div>
              <div className="kpi-label">Promedio por Cliente</div>
            </div>
          </div>
        );

      case 3:
        const productosData = data as AnalisisProducto[];
        const criticalStock = productosData.filter(row => row.estado_stock === 'Crítico').length;
        const outOfStock = productosData.filter(row => row.estado_stock === 'Agotado').length;
        const healthyStock = productosData.filter(row => row.estado_stock === 'Saludable').length;
        return (
          <div className="kpi-container">
            <div className="kpi-card">
              <div className="kpi-valor">{criticalStock}</div>
              <div className="kpi-label">Stock Crítico</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">{outOfStock}</div>
              <div className="kpi-label">Productos Agotados</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">{healthyStock}</div>
              <div className="kpi-label">Stock Saludable</div>
            </div>
          </div>
        );

      case 4:
        const ventasData = data as TendenciaVenta[];
        const totalSales = ventasData.reduce(
          (sum, row) => sum + parseFloat(row.ventas_mes || '0'),
          0
        );
        const avgMonthlySales = data.length > 0 ? totalSales / data.length : 0;
        const totalOrders = ventasData.reduce(
          (sum, row) => sum + row.ordenes_mes,
          0
        );
        return (
          <div className="kpi-container">
            <div className="kpi-card">
              <div className="kpi-valor">${totalSales.toFixed(2)}</div>
              <div className="kpi-label">Total Ventas (Período)</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">${avgMonthlySales.toFixed(2)}</div>
              <div className="kpi-label">Promedio Mensual</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">{totalOrders}</div>
              <div className="kpi-label">Total Órdenes</div>
            </div>
          </div>
        );

      case 5:
        const ordenesData = data as DetalleOrden[];
        const totalOrderValue = ordenesData.reduce(
          (sum, row) => sum + parseFloat(row.total_orden || '0'),
          0
        );
        const avgOrderValue = data.length > 0 ? totalOrderValue / data.length : 0;
        const totalItems = ordenesData.reduce(
          (sum, row) => sum + row.cantidad_items,
          0
        );
        return (
          <div className="kpi-container">
            <div className="kpi-card">
              <div className="kpi-valor">{data.length}</div>
              <div className="kpi-label">Órdenes Totales</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">${avgOrderValue.toFixed(2)}</div>
              <div className="kpi-label">Valor Promedio Orden</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-valor">{totalItems}</div>
              <div className="kpi-label">Items Totales</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="report-page">
      <Link href="/" className="link-volver">← REGRESAR A DASHBOARD</Link>

      <h1>Reporte: {title}</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>{description}</p>

      {showSearch && (
        <form className="formulario-busqueda">
          <label>Buscar: </label>
          <input
            name="query"
            defaultValue={query}
            className="input-busqueda"
          />
          <button type="submit" className="boton" style={{ marginLeft: 10 }}>Filtrar</button>
        </form>
      )}

      <ReportTable rows={data} />

      {showPagination && (
        <div className="paginacion">
          {page > 1 ? (
            <Link href={`/reports/${reportId}?page=${page - 1}&query=${query}`} className="boton">← Anterior</Link>
          ) : (
            <span className="boton" style={{ opacity: 0.5, cursor: 'not-allowed' }}>← Anterior</span>
          )}
          <span>Página {page}</span>
          {data.length === ITEMS_PER_PAGE ? (
            <Link href={`/reports/${reportId}?page=${page + 1}&query=${query}`} className="boton">Siguiente →</Link>
          ) : (
            <span className="boton" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Siguiente →</span>
          )}
        </div>
      )}

      {renderKPIs()}
    </div>
  );
}