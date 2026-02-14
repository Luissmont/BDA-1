DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_reader') THEN

      CREATE ROLE app_reader WITH LOGIN PASSWORD 'app_segu31';
   END IF;
END
$do$;

GRANT CONNECT ON DATABASE actividad_db TO app_reader;
GRANT USAGE ON SCHEMA public TO app_reader;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_reader;

GRANT SELECT ON v_categoria_rendimiento TO app_reader;
GRANT SELECT ON v_clientes_vip TO app_reader;
GRANT SELECT ON v_analisis_productos TO app_reader;
GRANT SELECT ON v_tendencias_ventas TO app_reader;
GRANT SELECT ON v_detalle_ordenes_completo TO app_reader;

ALTER ROLE app_reader SET default_transaction_read_only = on;
