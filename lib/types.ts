export interface CategoriaRendimiento {
    categoria: string;
    total_productos: number;
    stock_total: number;
    valor_inventario: string;
    precio_promedio: string;
}

export interface ClienteVIP {
    cliente: string;
    total_ordenes: number;
    total_gastado: string;
    nivel_cliente: 'Platinum' | 'Gold' | 'Silver';
}

export interface AnalisisProducto {
    producto: string;
    stock: number;
    precio: string;
    ratio_precio_mercado: string;
    estado_stock: 'Agotado' | 'Crítico' | 'Saludable';
}

export interface TendenciaVenta {
    mes: string;
    ordenes_mes: number;
    ventas_mes: string;
    ventas_acumuladas_anio: string;
}

export interface DetalleOrden {
    orden_id: number;
    contacto_cliente: string;
    status: 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';
    created_at: Date;
    cantidad_items: number;
    total_orden: string;
}

export type ReportData =
    | CategoriaRendimiento
    | ClienteVIP
    | AnalisisProducto
    | TendenciaVenta
    | DetalleOrden;
