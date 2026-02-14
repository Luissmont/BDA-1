# Lab Reportes dashboard con Next.js y PostgreSQL

## Descripción

Este proyecto es un dashboard de reportes que usa Next.js para el frontend y PostgreSQL para la base de datos. Todo se levanta con Docker Compose. La app consulta 5 views diferentes que calculan métricas de ventas, clientes e inventario.


## Cómo ejecutar

```bash
docker compose up --build
```

Esto crea las tablas, inserta datos de prueba, crea las views, índices y roles automáticamente. La app queda en http://localhost:3000

## Trade-offs: SQL vs Next.js

**Calculé en SQL:**

- **Agregaciones (SUM, COUNT, AVG)**: Decidí hacer los cálculos en la base de datos porque PostgreSQL tiene optimizaciones para esto. Si traía todas las filas a Next.js solo para sumarlas estaría desperdiciando ancho de banda y memoria del servidor.

- **Window Functions (ventas acumuladas)**: Usé `SUM() OVER()` en SQL para calcular ventas acumuladas por mes. Intenté hacerlo en JavaScript pero se complicaba mucho tener que ordenar manualmente y llevar un total acumulado. En SQL es una línea.

- **Clasificación con CASE (Platinum, Gold, Silver)**: Puse la lógica de niveles de clientes en la view con `CASE WHEN SUM(total) > 1000 THEN 'Platinum'`. Así si necesito cambiar los umbrales solo modifico el SQL, no tengo que recompilar Next.js.

- **Filtros con HAVING**: Usé `HAVING SUM(stock) > 0` para eliminar categorías sin inventario. Es más eficiente filtrar después del GROUP BY en SQL que traer filas vacías y descartarlas en JavaScript.

**Calculé en Next.js:**

- **Paginación con LIMIT/OFFSET**: Los parámetros de página vienen de la URL, así que los valido con Zod en el servidor de Next.js y luego los paso a SQL. Para un proyecto más grande debería usar paginación basada en cursores pero para este dataset pequeño LIMIT/OFFSET funciona bien.

---

## Performance

### Evidencia 1: Query de tendencias de ventas

```sql
EXPLAIN ANALYZE 
SELECT TO_CHAR(o.created_at, 'YYYY-MM') AS mes,
       COUNT(o.id) AS ordenes_mes,
       SUM(o.total) AS ventas_mes
FROM ordenes o
WHERE o.status IN ('pagado', 'entregado', 'enviado')
GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
ORDER BY mes DESC;
```

**Resultado:**
```
Sort  (cost=2.25..2.26 rows=12 width=44) (actual time=0.246..0.255 rows=12 loops=1)
  Sort Key: (to_char(created_at, 'YYYY-MM'::text)) DESC
  Sort Method: quicksort  Memory: 25kB
  ->  HashAggregate  (cost=2.21..2.23 rows=12 width=44) (actual time=0.194..0.210 rows=12 loops=1)
        Group Key: to_char(created_at, 'YYYY-MM'::text)
        Batches: 1  Memory Usage: 40kB
        ->  Seq Scan on ordenes o  (cost=0.00..1.40 rows=29 width=12) (actual time=0.018..0.067 rows=29 loops=1)
              Filter: (status = ANY ('{pagado,entregado,enviado}'::text[]))
              Rows Removed by Filter: 1
Planning Time: 0.548 ms
Execution Time: 0.350 ms
```

El query usa HashAggregate para agrupar las órdenes por mes. Con 30 órdenes PostgreSQL hace un Seq Scan que es más rápido que usar un índice. Cuando la tabla crezca a miles de registros, el índice en `created_at` hará que cambie automáticamente a Index Scan.

---

### Evidencia 2: Join de categorías con productos

```sql
EXPLAIN ANALYZE 
SELECT c.nombre AS categoria,
       COUNT(p.id) AS total_productos,
       SUM(p.stock) AS stock_total
FROM categorias c
JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
HAVING SUM(p.stock) > 0;
```

**Resultado:**
```
HashAggregate  (cost=27.94..28.19 rows=5 width=48) (actual time=0.319..0.334 rows=3 loops=1)
  Group Key: c.id, c.nombre
  Filter: (sum(p.stock) > 0)
  Batches: 1  Memory Usage: 40kB
  ->  Hash Join  (cost=12.70..27.75 rows=16 width=44) (actual time=0.194..0.255 rows=16 loops=1)
        Hash Cond: (p.categoria_id = c.id)
        ->  Seq Scan on productos p  (cost=0.00..14.20 rows=420 width=12) (actual time=0.011..0.045 rows=16 loops=1)
        ->  Hash  (cost=12.50..12.50 rows=5 width=36) (actual time=0.155..0.157 rows=5 loops=1)
              Buckets: 1024  Batches: 1  Memory Usage: 9kB
              ->  Seq Scan on categorias c  (cost=0.00..12.50 rows=5 width=36) (actual time=0.010..0.021 rows=5 loops=1)
Planning Time: 0.648 ms
Execution Time: 0.461 ms
```

Este query hace un Hash Join entre categorías y productos. El HAVING filtra las categorías sin stock después de agrupar, lo cual es importante para no mostrar categorías vacías. Tiempo total: 0.46ms.

---

## Justificación de Índices

Creé 4 índices para optimizar las queries:

1. **idx_ordenes_created_at**: Ayuda a la view de tendencias cuando agrupa por mes. Sin él, ordenar por fecha requeriría un sort completo.

2. **idx_ordenes_usuario_id**: Acelera el JOIN entre usuarios y órdenes en las views de clientes VIP y detalle de órdenes.

3. **idx_productos_categoria_id**: Optimiza el GROUP BY cuando agrupo productos por categoría.

4. **idx_orden_detalles_orden_id**: Permite encontrar rápido todos los items de una orden para el conteo.

---

## Threat Model

**Prevención de SQL Injection:**

1. Uso queries parametrizadas con `pool.query(sql, [param1, param2])` en vez de concatenar strings. Los parámetros se pasan como `$1, $2` para que PostgreSQL los trate como datos, no como código SQL.

2. Valido todos los inputs con Zod antes de pasarlos a SQL. Si alguien intenta escribir `'; DROP TABLE--` en un filtro, Zod lo rechaza antes de que llegue a la base de datos.

3. Los reportId solo pueden ser 1-5 (hardcoded en un switch). No hay forma de inyectar `ORDER BY` dinámico o queries arbitrarias.

**Protección de credenciales:**

4. Las credenciales están en variables de entorno (`process.env`), nunca hardcodeadas. El archivo .env no está en Git, solo hay un .env.example con placeholders.

5. La conexión a PostgreSQL solo existe en Server Components de Next.js. El navegador nunca ve las credenciales porque todo se ejecuta server-side.

**Permisos mínimos:**

6. Creé un usuario `app_reader` que solo puede hacer SELECT en las 5 views. No tiene acceso a las tablas base y no puede hacer INSERT, UPDATE o DELETE. Incluso si hubiera SQL injection, no podría modificar datos.

---

## Bitácora de IA

### 1. Window Functions para acumulados

**Pregunta:**
"¿Cómo calculo un total acumulado en SQL? Necesito que las ventas de cada mes se vayan sumando"

**Lo que hice:**
Me explicó que podía usar `SUM() OVER (ORDER BY mes)` para ir acumulando sin perder el detalle de cada mes. Tomé el ejemplo y lo adapté a mi query.

**Validación:**
Revisé manualmente que los números tuvieran sentido. Si enero era 1000 y febrero 500, el acumulado de febrero debía ser 1500.

**Corrección:**
El código inicial sumaba todas las órdenes incluso canceladas. Agregué yo el filtro `WHERE status IN ('pagado', 'entregado', 'enviado')`.

---

### 2. Paginación con LIMIT y OFFSET

**Pregunta:**
"¿Cómo funciona la paginación con LIMIT y OFFSET? ¿Cómo leo el número de página de la URL en Next.js?"

**Lo que hice:**
Me explicaron la fórmula `OFFSET = (página - 1) * items_por_página`. Implementé la lógica en el servidor.

**Validación:**
Probé navegar entre páginas y poner `page=-5` en la URL para ver si Zod lo rechazaba.

**Corrección:**
Me dio un ejemplo con `z.number()` pero Next.js pasa strings ("5"). Busqué en la documentación de Zod y encontré `z.coerce.number()` que convierte automáticamente.

---

### 3. Índices en PostgreSQL

**Pregunta:**
"¿Para qué sirven los índices? ¿Cuándo debo crear uno?"

**Lo que hice:**
Me explicaron que son como el índice de un libro: ayudan a encontrar información rápido. Son útiles en columnas que uso en WHERE, JOIN o GROUP BY.

**Validación:**
Usé EXPLAIN ANALYZE antes y después de crear índices para comparar tiempos.

**Corrección:**
Me sugirió un índice en `ordenes(total)` pero yo no filtro por esa columna, solo sumo. Lo cambié por `idx_ordenes_usuario_id` que sí ayuda en los JOINs.

---

### 4. Queries parametrizadas

**Pregunta:**
"¿Por qué es peligroso hacer `SELECT * FROM tabla WHERE nombre = '${input}'`? ¿Cuál es la forma segura?"

**Lo que hice:**
Me mostró ejemplos de SQL injection y cómo las queries parametrizadas evitan esto tratando el input como datos.

**Validación:**
Intenté inyectar `'; DELETE FROM ordenes--` en el buscador y revisé los logs de PostgreSQL para confirmar que llegó como string literal.

**Corrección:**
No necesité corregir nada, el ejemplo con `$1, $2` funcionó a la primera.

---

### 5. Usuario con permisos restringidos

**Pregunta:**
"¿Cómo creo un usuario en PostgreSQL que solo pueda ver views pero no modificar nada?"

**Lo que hice:**
Me enseñaron CREATE ROLE, GRANT SELECT y REVOKE ALL. Entendí que puedo limitar por tipo de query y por objeto.

**Validación:**
Me conecté como `app_reader` e intenté hacer INSERT. PostgreSQL me dio error de permisos.

**Corrección:**
Al principio el usuario podía ver las tablas base. Tuve que agregar REVOKE ALL antes de los GRANT para asegurar que solo viera las views.


## Verificar instalación

Listar las 5 views:
```bash
docker compose exec postgres psql -U app_reader -d actividad_db -c "\dv"
```

**Resultado obtenido:**
```
                   List of relations
 Schema |            Name            | Type |  Owner
--------+----------------------------+------+----------
 public | v_analisis_productos       | view | postgres
 public | v_categoria_rendimiento    | view | postgres
 public | v_clientes_vip             | view | postgres
 public | v_detalle_ordenes_completo | view | postgres
 public | v_tendencias_ventas        | view | postgres
(5 rows)
```

Ejecutar el script de verificación completo:
```bash
bash scripts/verify.sh
```


