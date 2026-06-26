-- Agregar columna rol a la tabla clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'usuario';

-- Agregar constraint CHECK para que aparezca como desplegable en el editor de Supabase
ALTER TABLE clientes ADD CONSTRAINT clientes_rol_check CHECK (rol IN ('admin', 'vendedor', 'usuario'));

-- Crear índice para consultas por rol
CREATE INDEX IF NOT EXISTS idx_clientes_rol ON clientes(rol);

-- Actualizar los datos existentes para que todos sean 'usuario' por defecto
UPDATE clientes SET rol = 'usuario' WHERE rol IS NULL;

-- Insertar un usuario admin de prueba (email: admin@botanikape.com, pass: admin123)
-- Nota: En producción usar bcrypt, esto es base64 para demo
INSERT INTO clientes (nombre, email, password_hash, salt, rol, activo) VALUES
('Administrador', 'admin@botanikape.com', 'YWRtaW4xMjM=', 'YWRtaW5AZG90YW5raWFwZQ==', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;