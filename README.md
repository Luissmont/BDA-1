Indices

Para asegurar que los reportes carguen rapido , se implementaron tres indices estrategicos en el archivo db/indexes.sql.

1
Indice en la fecha de creacion de ordenes (idx_ordenes_created_at) este indice es fundamental para el reporte de "Tendencias de Ventas". Como esa vista necesita agrupar y ordenar las ventas mes a mes, el indice permite que la base de datos acceda a los registros ya ordenados cronologicamente. Sin esto postgres tendria que leer toda la tabla desordenada y ordenarla en memoria cada vez, lo cual iria lento. Al ejecutar EXPLAIN en una consulta de ordenamiento por fecha, se utiliza un index scan en lugar de una lectura secuencial.

2
Indice en el ID de usuario dentro de ordenes (idx_ordenes_usuario_id) Este indice optimiza los reportes que cruzan informacion de clientes con sus compras, como el de clientes VIP. Funciona como un atajo, cuando necesitamos calcular el total gastado por un cliente especifico, el indice permite encontrar sus ordenes de inmediato sin tener que escanear la tabla completa de ordenes buscando coincidencias. Al filtrar ordenes por un usuario, el plan de ejecucion muestra un bitmap heap scan, indicando que el acceso es directo y eficiente.

3
Indice en la categoria de los productos (idx_productos_categoria_id) Utilizado para el reporte de rendimiento de categorias. Dado que esta vista une la tabla de categorias con la de productos para sumar stocks y precios, este indice acelera el proceso de agrupar los productos por su tipo. Evita que la base de datos tenga que revisar producto por producto para ver a que categoria pertenece. El uso del indice se confirma mediante EXPLAIN al observar que las uniones (JOINs) utilizan el indice de categoria para filtrar los resultados.