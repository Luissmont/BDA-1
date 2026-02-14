'use server';

import pool from '@/lib/db';
import type {
    CategoriaRendimiento,
    ClienteVIP,
    AnalisisProducto,
    TendenciaVenta,
    DetalleOrden,
} from '@/lib/types';

export async function getCategoriaRendimiento(): Promise<CategoriaRendimiento[]> {
    const sql = 'SELECT * FROM v_categoria_rendimiento ORDER BY valor_inventario DESC';
    const result = await pool.query<CategoriaRendimiento>(sql);
    return result.rows;
}

export async function getClientesVIP(query?: string): Promise<ClienteVIP[]> {
    const sql = query
        ? 'SELECT * FROM v_clientes_vip WHERE cliente ILIKE $1 ORDER BY total_gastado DESC'
        : 'SELECT * FROM v_clientes_vip ORDER BY total_gastado DESC';

    const params = query ? [`%${query}%`] : [];
    const result = await pool.query<ClienteVIP>(sql, params);
    return result.rows;
}

export async function getAnalisisProductos(): Promise<AnalisisProducto[]> {
    const sql = 'SELECT * FROM v_analisis_productos ORDER BY ratio_precio_mercado ASC';
    const result = await pool.query<AnalisisProducto>(sql);
    return result.rows;
}

export async function getTendenciasVentas(
    page: number = 1,
    itemsPerPage: number = 10
): Promise<TendenciaVenta[]> {
    const offset = (page - 1) * itemsPerPage;
    const sql = 'SELECT * FROM v_tendencias_ventas ORDER BY mes DESC LIMIT $1 OFFSET $2';

    const result = await pool.query<TendenciaVenta>(sql, [itemsPerPage, offset]);
    return result.rows;
}

export async function getDetalleOrdenes(
    page: number = 1,
    itemsPerPage: number = 10,
    query?: string
): Promise<DetalleOrden[]> {
    const offset = (page - 1) * itemsPerPage;

    const sql = query
        ? 'SELECT * FROM v_detalle_ordenes_completo WHERE contacto_cliente ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3'
        : 'SELECT * FROM v_detalle_ordenes_completo ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    const params = query ? [`%${query}%`, itemsPerPage, offset] : [itemsPerPage, offset];
    const result = await pool.query<DetalleOrden>(sql, params);
    return result.rows;
}
