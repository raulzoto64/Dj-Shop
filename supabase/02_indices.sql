-- Índices para optimizar consultas

-- Productos
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX idx_productos_nombre ON productos USING GIN (to_tsvector('spanish', nombre));

-- Pedidos
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_created_at ON pedidos(created_at DESC);

-- Detalles de Pedido
CREATE INDEX idx_detalles_pedido_pedido_id ON detalles_pedido(pedido_id);
CREATE INDEX idx_detalles_pedido_producto_id ON detalles_pedido(producto_id);

-- Reseñas
CREATE INDEX idx_resenas_producto_id ON resenas(producto_id);
CREATE INDEX idx_resenas_cliente_id ON resenas(cliente_id);
CREATE INDEX idx_resenas_calificacion ON resenas(calificacion DESC);
