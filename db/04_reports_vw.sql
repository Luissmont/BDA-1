
/*
Vista 1: Rendimiento por Categoria
Aqui sacamos un resumen de cómo va el inventario en cada categoria.
Grain: Una fila por cada categoría (ej: Ropa, Electronica).
Metricas: Cuántos productos distintos tenemos, stock total acumulado.
valor monetario (cuánto dinero vale ese stock), el precio promedio.
Group By: Agrupamos por el ID y nombre de la categoría para poder sumar sus productos.
Verify: SELECT * FROM v_categoria_rendimiento ORDER BY valor_inventario DESC;
*/

CREATE OR REPLACE VIEW v_categoria_rendimiento AS
SELECT 
    c.nombre AS categoria,
    COUNT(p.id) AS total_productos,
    SUM(p.stock) AS stock_total,
    SUM(p.precio * p.stock) AS valor_inventario,
    COALESCE(AVG(p.precio), 0) AS precio_promedio
FROM categorias c
JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre;

/*
Vista 2: Clientes VIP
Lista de usuarios que han comprado clasificándolos según cuánto han gastado.
Grain: Una fila por cliente.
Metricas: Total de ordenes, total gastado y su nivel platinum,gold,dilver).
Having: para filtrar y quitar a los usuarios que se registraron pero no han gastado nada.
Group by: Necesario para sumar todas las compras de un mismo usuario.
Verify: SELECT * FROM v_clientes_vip WHERE nivel_cliente = 'Platinum';
*/

CREATE OR REPLACE VIEW v_clientes_vip AS
SELECT 
    u.nombre AS cliente,
    COUNT(o.id) AS total_ordenes,
    SUM(o.total) AS total_gastado,
    CASE 
        WHEN SUM(o.total) > 1000 THEN 'Platinum'
        WHEN SUM(o.total) > 500 THEN 'Gold'
        ELSE 'Silver'
    END AS nivel_cliente
FROM usuarios u
JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre
HAVING SUM(o.total) > 0;

/*
Vista 3: Análisis de Productos
Un chequeo rápido de la salud de cada producto individual.
Grain: Una fila por producto.
Metricas: Ratio de precio, si esta ms caro o barato que el promedio del mercado.
Estado del stock, calculado con CASE para ver si es critico o saludable.
CTE: WITH para calcular el promedio global una sola vez al principio.
Verify: SELECT * FROM v_analisis_productos WHERE estado_stock = 'Crítico';
*/

CREATE OR REPLACE VIEW v_analisis_productos AS
WITH promedio_global AS (
    SELECT AVG(precio) as precio_avg_mercado FROM productos
)
SELECT 
    p.nombre AS producto,
    p.stock,
    p.precio,
    ROUND((p.precio / (SELECT precio_avg_mercado FROM promedio_global))::numeric, 2) AS ratio_precio_mercado,
    CASE 
        WHEN p.stock = 0 THEN 'Agotado'
        WHEN p.stock < 10 THEN 'Crítico'
        ELSE 'Saludable'
    END AS estado_stock
FROM productos p;

/*
Vista 4: Tendencias de Ventas
Historial de ventas agrupado mes a mes para ver como vamos.
Grain: Una fila por mes YYYY-MM.
Metricas: Ventas de ese mes y el acumulado anual.
Window Function: SUM() OVER() para ir sumando lo del mes anterior al actual.
Group By: Se agrupan las órdenes por su fecha truncadas a mes.
Verify: SELECT * FROM v_tendencias_ventas ORDER BY mes DESC;
*/

CREATE OR REPLACE VIEW v_tendencias_ventas AS
SELECT 
    TO_CHAR(o.created_at, 'YYYY-MM') AS mes,
    COUNT(o.id) AS ordenes_mes,
    SUM(o.total) AS ventas_mes,
    SUM(SUM(o.total)) OVER (ORDER BY TO_CHAR(o.created_at, 'YYYY-MM')) AS ventas_acumuladas_anio
FROM ordenes o
WHERE o.status IN ('pagado', 'entregado', 'enviado')
GROUP BY TO_CHAR(o.created_at, 'YYYY-MM');

/*
Vista 5: Detalle Completo
Reporte granular de cada orden para auditoria o revision.
Grain: Una fila por orden.
Metricas: Cuantos items distintos tiene la orden y el total a pagar.
Group By: se agrupa por el id de la orden para poder contar los items (COUNT) sin duplicar la fila de la orden.
Verify: SELECT * FROM v_detalle_ordenes_completo LIMIT 5;
*/

CREATE OR REPLACE VIEW v_detalle_ordenes_completo AS
SELECT 
    o.id AS orden_id,
    u.email AS contacto_cliente,
    o.status,
    o.created_at,
    COUNT(od.id) AS cantidad_items,
    COALESCE(o.total, 0) AS total_orden
FROM ordenes o
JOIN usuarios u ON o.usuario_id = u.id
LEFT JOIN orden_detalles od ON o.id = od.orden_id
GROUP BY o.id, u.email, o.status, o.created_at, o.total;