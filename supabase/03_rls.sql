-- Habilitar Row Level Security (RLS) en las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto_etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para la tabla 'clientes'
CREATE POLICY "Clientes pueden ver sus propios perfiles" ON clientes
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Clientes pueden actualizar sus propios perfiles" ON clientes
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Cualquiera puede crear un cliente (registro)" ON clientes
    FOR INSERT WITH CHECK (TRUE);

-- Políticas RLS para la tabla 'categorias'
CREATE POLICY "Categorías son públicas para todos" ON categorias
    FOR SELECT USING (TRUE);

-- Políticas RLS para la tabla 'productos'
CREATE POLICY "Productos son públicos para todos" ON productos
    FOR SELECT USING (TRUE);

-- Políticas RLS para la tabla 'etiquetas'
CREATE POLICY "Etiquetas son públicas para todos" ON etiquetas
    FOR SELECT USING (TRUE);

-- Políticas RLS para la tabla 'producto_etiquetas'
CREATE POLICY "Producto_etiquetas son públicas para todos" ON producto_etiquetas
    FOR SELECT USING (TRUE);

-- Políticas RLS para la tabla 'pedidos'
CREATE POLICY "Clientes pueden ver sus propios pedidos" ON pedidos
    FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Clientes autenticados pueden crear pedidos" ON pedidos
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);

-- Políticas RLS para la tabla 'detalles_pedido'
CREATE POLICY "Detalles de pedido son accesibles por el dueño del pedido" ON detalles_pedido
    FOR SELECT USING ((SELECT cliente_id FROM pedidos WHERE id = pedido_id) = auth.uid());
CREATE POLICY "Detalles de pedido pueden ser creados por clientes autenticados" ON detalles_pedido
    FOR INSERT WITH CHECK ((SELECT cliente_id FROM pedidos WHERE id = pedido_id) = auth.uid());

-- Políticas RLS para la tabla 'resenas'
CREATE POLICY "Resenas son públicas para todos" ON resenas
    FOR SELECT USING (TRUE);
CREATE POLICY "Clientes autenticados pueden crear resenas" ON resenas
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);
CREATE POLICY "Clientes pueden actualizar sus propias resenas" ON resenas
    FOR UPDATE USING (auth.uid() = cliente_id);
CREATE POLICY "Clientes pueden eliminar sus propias resenas" ON resenas
    FOR DELETE USING (auth.uid() = cliente_id);
