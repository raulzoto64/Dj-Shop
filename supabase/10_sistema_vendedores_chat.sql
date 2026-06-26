-- ============================================
-- SISTEMA DE VENDEDORES/COMERCIANTES
-- ============================================

-- Agregar columnas de usuario a productos y categorías
ALTER TABLE productos ADD COLUMN IF NOT EXISTS usuario_id UUID;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS usuario_id UUID;

-- Crear tabla de vendedores/comerciantes
CREATE TABLE IF NOT EXISTS vendedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nombre_tienda VARCHAR(255) NOT NULL,
    descripcion TEXT,
    logo_url TEXT,
    banner_url TEXT,
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    rating_promedio DECIMAL(3,2) DEFAULT 0,
    total_ventas INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMPTZ DEFAULT now(),
    UNIQUE(cliente_id)
);

-- Crear índice para búsquedas de vendedores
CREATE INDEX IF NOT EXISTS idx_vendedores_cliente ON vendedores(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendedores_activo ON vendedores(activo);

-- ============================================
-- SISTEMA DE CHAT/MENSAJES
-- ============================================

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente1_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    cliente2_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    ultimo_mensaje TEXT,
    fecha_ultimo_mensaje TIMESTAMPTZ DEFAULT now(),
    leido_por_cliente1 BOOLEAN DEFAULT FALSE,
    leido_por_cliente2 BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT now(),
    CHECK (cliente1_id != cliente2_id),
    UNIQUE(cliente1_id, cliente2_id)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id UUID NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
    remitente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    tipo_mensaje VARCHAR(20) DEFAULT 'texto', -- 'texto', 'imagen', 'video'
    imagen_url TEXT,
    video_url TEXT,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMPTZ DEFAULT now()
);

-- Índices para chat
CREATE INDEX IF NOT EXISTS idx_conversaciones_cliente1 ON conversaciones(cliente1_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_cliente2 ON conversaciones(cliente2_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes(fecha_envio DESC);

-- ============================================
-- SISTEMA DE RESEÑAS CON IMAGEN/VIDEO
-- ============================================

-- Modificar tabla resenas para soportar imagen y video
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS calificacion_servicio INTEGER CHECK (calificacion_servicio >= 1 AND calificacion_servicio <= 5);
ALTER TABLE resenas ADD COLUMN IF NOT EXISTS calificacion_producto INTEGER CHECK (calificacion_producto >= 1 AND calificacion_producto <= 5);

-- ============================================
-- SISTEMA DE ETIQUETAS PERSONALIZADAS
-- ============================================

-- Modificar tabla etiquetas para que puedan ser creadas por usuarios
ALTER TABLE etiquetas ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE etiquetas ADD COLUMN IF NOT EXISTS es_global BOOLEAN DEFAULT FALSE;

-- ============================================
-- TRIGGERS PARA ACTUALIZAR RATING
-- ============================================

-- Función para actualizar rating de vendedor
CREATE OR REPLACE FUNCTION actualizar_rating_vendedor()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendedores
    SET rating_promedio = (
        SELECT COALESCE(AVG(calificacion_servicio), 0)
        FROM resenas
        WHERE vendedor_id = NEW.vendedor_id
    )
    WHERE id = NEW.vendedor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar rating automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_rating ON resenas;
CREATE TRIGGER trigger_actualizar_rating
    AFTER INSERT OR UPDATE ON resenas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_rating_vendedor();

-- ============================================
-- RLS POLICIES NUEVAS
-- ============================================

-- Vendedores: todos pueden ver, solo el dueño puede editar
CREATE POLICY "Vendedores son visibles para todos" ON vendedores
    FOR SELECT USING (TRUE);

CREATE POLICY "Vendedores pueden actualizar su propio perfil" ON vendedores
    FOR UPDATE USING (cliente_id = auth.uid());

CREATE POLICY "Vendedores pueden insertar su propio perfil" ON vendedores
    FOR INSERT WITH CHECK (cliente_id = auth.uid());

-- Conversaciones: participantes pueden ver
CREATE POLICY "Participantes pueden ver conversaciones" ON conversaciones
    FOR SELECT USING (cliente1_id = auth.uid() OR cliente2_id = auth.uid());

CREATE POLICY "Participantes pueden crear conversaciones" ON conversaciones
    FOR INSERT WITH CHECK (cliente1_id = auth.uid() OR cliente2_id = auth.uid());

CREATE POLICY "Participantes pueden actualizar conversaciones" ON conversaciones
    FOR UPDATE USING (cliente1_id = auth.uid() OR cliente2_id = auth.uid());

-- Mensajes: participantes de la conversación pueden ver
CREATE POLICY "Participantes pueden ver mensajes" ON mensajes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM conversaciones
            WHERE id = mensajes.conversacion_id
            AND (cliente1_id = auth.uid() OR cliente2_id = auth.uid())
        )
    );

CREATE POLICY "Participantes pueden enviar mensajes" ON mensajes
    FOR INSERT WITH CHECK (
        remitente_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM conversaciones
            WHERE id = mensajes.conversacion_id
            AND (cliente1_id = auth.uid() OR cliente2_id = auth.uid())
        )
    );

-- Resenas: todos pueden ver, usuarios autenticados pueden crear
CREATE POLICY "Resenas son públicas" ON resenas
    FOR SELECT USING (TRUE);

CREATE POLICY "Usuarios autenticados pueden crear resenas" ON resenas
    FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "Usuarios pueden editar sus resenas" ON resenas
    FOR UPDATE USING (auth.uid() = cliente_id);

CREATE POLICY "Usuarios pueden eliminar sus resenas" ON resenas
    FOR DELETE USING (auth.uid() = cliente_id);

-- Etiquetas: todos pueden ver, usuarios autenticados pueden crear
CREATE POLICY "Etiquetas son públicas" ON etiquetas
    FOR SELECT USING (TRUE);

CREATE POLICY "Usuarios autenticados pueden crear etiquetas" ON etiquetas
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Productos con vendedor: todos pueden ver
CREATE POLICY "Productos con vendedor son públicos" ON productos
    FOR SELECT USING (TRUE);

-- Categorías con vendedor: todos pueden ver
CREATE POLICY "Categorías con vendedor son públicas" ON categorias
    FOR SELECT USING (TRUE);