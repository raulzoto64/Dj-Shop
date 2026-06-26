-- Quitar TODOS los permisos de escritura (INSERT/UPDATE/DELETE) para:
-- categorias, productos, resenas, mensajes, etiquetas, producto_etiquetas,
-- pedidos, detalles_pedido, vendedores, conversaciones
-- Solo deja SELECT (lectura) y registro de clientes

-- ============================================
-- CATEGORIAS: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Admin puede crear categorias" ON categorias;
DROP POLICY IF EXISTS "Admin puede editar categorias" ON categorias;
DROP POLICY IF EXISTS "Admin puede eliminar categorias" ON categorias;
DROP POLICY IF EXISTS "Vendedores pueden insertar categorias" ON categorias;
DROP POLICY IF EXISTS "Vendedores pueden editar sus categorias" ON categorias;
DROP POLICY IF EXISTS "Categorías con vendedor son públicas" ON categorias;

-- ============================================
-- PRODUCTOS: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Admin puede crear productos" ON productos;
DROP POLICY IF EXISTS "Admin puede editar productos" ON productos;
DROP POLICY IF EXISTS "Admin puede eliminar productos" ON productos;
DROP POLICY IF EXISTS "Vendedores pueden insertar productos" ON productos;
DROP POLICY IF EXISTS "Vendedores pueden editar sus productos" ON productos;
DROP POLICY IF EXISTS "Vendedores pueden eliminar sus productos" ON productos;
DROP POLICY IF EXISTS "Productos con vendedor son públicos" ON productos;

-- ============================================
-- RESEÑAS: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Clientes autenticados pueden crear resenas" ON resenas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear resenas" ON resenas;
DROP POLICY IF EXISTS "Clientes pueden actualizar sus propias resenas" ON resenas;
DROP POLICY IF EXISTS "Usuarios pueden editar sus resenas" ON resenas;
DROP POLICY IF EXISTS "Clientes pueden eliminar sus propias resenas" ON resenas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus resenas" ON resenas;

-- ============================================
-- MENSAJES: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Participantes pueden enviar mensajes" ON mensajes;

-- ============================================
-- ETIQUETAS: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear etiquetas" ON etiquetas;
DROP POLICY IF EXISTS "Vendedores pueden crear etiquetas" ON etiquetas;

-- ============================================
-- PRODUCTO_ETIQUETAS: eliminar políticas de escritura si existen
-- ============================================
DROP POLICY IF EXISTS "Usuarios pueden crear producto_etiquetas" ON producto_etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden editar producto_etiquetas" ON producto_etiquetas;
DROP POLICY IF EXISTS "Usuarios pueden eliminar producto_etiquetas" ON producto_etiquetas;

-- ============================================
-- VENDEDORES: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Vendedores pueden actualizar su propio perfil" ON vendedores;
DROP POLICY IF EXISTS "Vendedores pueden insertar su propio perfil" ON vendedores;

-- ============================================
-- CONVERSACIONES: eliminar políticas de escritura, mantener solo SELECT
-- ============================================
DROP POLICY IF EXISTS "Participantes pueden crear conversaciones" ON conversaciones;
DROP POLICY IF EXISTS "Participantes pueden actualizar conversaciones" ON conversaciones;

-- ============================================
-- PEDIDOS y DETALLES_PEDIDO: eliminar políticas de escritura
-- ============================================
DROP POLICY IF EXISTS "Clientes autenticados pueden crear pedidos" ON pedidos;
DROP POLICY IF EXISTS "Detalles de pedido pueden ser creados por clientes autenticados" ON detalles_pedido;

-- ============================================
-- CLIENTES: NO se tocan (necesarias para registro y perfil)
-- ============================================
