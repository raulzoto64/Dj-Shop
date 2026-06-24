-- Verificar cuántos productos hay
SELECT COUNT(*) AS total_productos FROM productos;

-- Ver los productos existentes
SELECT id, nombre, categoria_id, precio FROM productos ORDER BY id;

-- Si está vacía, insertar los datos