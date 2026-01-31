
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


CREATE OR REPLACE VIEW v_tendencias_ventas AS
SELECT 
    TO_CHAR(o.created_at, 'YYYY-MM') AS mes,
    COUNT(o.id) AS ordenes_mes,
    SUM(o.total) AS ventas_mes,
    SUM(SUM(o.total)) OVER (ORDER BY TO_CHAR(o.created_at, 'YYYY-MM')) AS ventas_acumuladas_anio
FROM ordenes o
WHERE o.status IN ('pagado', 'entregado', 'enviado')
GROUP BY TO_CHAR(o.created_at, 'YYYY-MM');


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