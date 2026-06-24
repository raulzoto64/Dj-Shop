-- Función para actualizar la columna updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la tabla productos
CREATE TRIGGER update_productos_updated_at
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
