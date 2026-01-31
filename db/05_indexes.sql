
CREATE INDEX IF NOT EXISTS idx_ordenes_created_at ON ordenes(created_at);


CREATE INDEX IF NOT EXISTS idx_productos_precio ON productos(precio);

CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);