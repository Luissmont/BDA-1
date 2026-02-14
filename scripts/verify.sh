#!/bin/bash

echo "   SCRIPT DE VERIFICACIÓN - TAREA 6"
echo ""

echo "1. Listando VIEWS creadas "
docker compose exec postgres psql -U app_reader -d actividad_db -c "\dv"
echo ""

echo "2. Verificando View 1: v_categoria_rendimiento "
docker compose exec postgres psql -U app_reader -d actividad_db -c "SELECT * FROM v_categoria_rendimiento ORDER BY valor_inventario DESC LIMIT 3;"
echo ""

echo "3. Verificando View 2: v_clientes_vip "
docker compose exec postgres psql -U app_reader -d actividad_db -c "SELECT * FROM v_clientes_vip WHERE nivel_cliente = 'Platinum' LIMIT 3;"
echo ""

echo "4. Verificando View 3: v_analisis_productos "
docker compose exec postgres psql -U app_reader -d actividad_db -c "SELECT * FROM v_analisis_productos WHERE estado_stock = 'Crítico' LIMIT 3;"
echo ""

echo "5. Verificando View 4: v_tendencias_ventas "
docker compose exec postgres psql -U app_reader -d actividad_db -c "SELECT * FROM v_tendencias_ventas ORDER BY mes DESC LIMIT 3;"
echo ""

echo "6. Verificando View 5: v_detalle_ordenes_completo "
docker compose exec postgres psql -U app_reader -d actividad_db -c "SELECT * FROM v_detalle_ordenes_completo LIMIT 3;"
echo ""

echo "7. Listando Índices creados "
docker compose exec postgres psql -U postgres -d actividad_db -c "\di idx_*"
echo ""

echo "8. Verificando permisos del usuario app_reader "
docker compose exec postgres psql -U postgres -d actividad_db -c "SELECT table_name, privilege_type FROM information_schema.table_privileges WHERE grantee = 'app_reader' ORDER BY table_name;"
echo ""

echo "   VERIFICACIÓN COMPLETADA"
