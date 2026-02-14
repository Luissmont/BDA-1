
CREATE INDEX IF NOT EXISTS idx_ordenes_created_at ON ordenes(created_at);

CREATE INDEX IF NOT EXISTS idx_ordenes_usuario_id ON ordenes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON productos(categoria_id);