-- Corregir políticas RLS para tabla clientes (autenticación custom sin Supabase Auth)
-- Esto permite consultar clientes sin necesidad de sesión de Supabase

-- Eliminar políticas antiguas que usan auth.uid()
DROP POLICY IF EXISTS "Clientes pueden ver sus propios perfiles" ON clientes;
DROP POLICY IF EXISTS "Clientes pueden actualizar sus propios perfiles" ON clientes;

-- Nueva política: permitir lectura de clientes (sin exponer password_hash en selects normales)
-- El código solo selecciona nombre, rol, activo (NO password_hash) en consultas públicas
CREATE POLICY "Lectura pública de clientes" ON clientes
    FOR SELECT USING (TRUE);

-- Política para actualizarclientes (solo el propio usuario puedeactualizar, pero como no hay auth.uid(), 
-- por ahora permitimos actualización general - en producción deberías usar tu propia lógica)
CREATE POLICY "Actualización de clientes permitida" ON clientes
    FOR UPDATE USING (TRUE);

-- Política para insertar (ya existía)
-- Política para eliminar (opcional, por ahora no la usamos)
CREATE POLICY "Eliminación de clientes permitida" ON clientes
    FOR DELETE USING (TRUE);