DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'userpp') THEN

      CREATE ROLE userpp WITH LOGIN PASSWORD 'pass123';
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE actividad_db TO userpp;

GRANT USAGE ON SCHEMA public TO userpp;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM userpp;

GRANT SELECT ON v_categoria_rendimiento TO userpp;
GRANT SELECT ON v_clientes_vip TO userpp;
GRANT SELECT ON v_analisis_productos TO userpp;
GRANT SELECT ON v_tendencias_ventas TO userpp;
GRANT SELECT ON v_detalle_ordenes_completo TO userpp;

