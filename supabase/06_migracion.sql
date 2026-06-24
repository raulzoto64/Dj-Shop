-- Migración: Renombrar tabla reseñas → resenas y agregar UNIQUE a productos.nombre
-- Ejecutar solo si las tablas ya existen de una ejecución anterior

-- 1. Renombrar la tabla reseñas a resenas (sin ñ)
ALTER TABLE IF EXISTS reseñas RENAME TO resenas;

-- 2. Agregar la constraint UNIQUE a productos.nombre (para ON CONFLICT)
ALTER TABLE productos ADD CONSTRAINT productos_nombre_key UNIQUE (nombre);

-- 3. Renombrar los índices existentes si están con el nombre antiguo
ALTER INDEX IF EXISTS idx_reseñas_producto_id RENAME TO idx_resenas_producto_id;
ALTER INDEX IF EXISTS idx_reseñas_cliente_id RENAME TO idx_resenas_cliente_id;
ALTER INDEX IF EXISTS idx_reseñas_calificacion RENAME TO idx_resenas_calificacion;