-- Crear la tabla de clientes
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    ciudad VARCHAR(100),
    referencia TEXT,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT now(),
    ultimo_acceso TIMESTAMPTZ,
    activo BOOLEAN DEFAULT TRUE
);

-- Crear la tabla de categorias
CREATE TABLE categorias (
    id TEXT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT
);

-- Crear la tabla de productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    categoria_id TEXT REFERENCES categorias(id),
    precio NUMERIC(10, 2) NOT NULL,
    precio_anterior NUMERIC(10, 2),
    imagen TEXT,
    descripcion TEXT,
    stock INT NOT NULL,
    peso VARCHAR(50),
    origen VARCHAR(100),
    rating NUMERIC(2, 1),
    etiquetas TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear la tabla de etiquetas
CREATE TABLE etiquetas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Crear la tabla intermedia producto_etiquetas
CREATE TABLE producto_etiquetas (
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    etiqueta_id INT REFERENCES etiquetas(id) ON DELETE CASCADE,
    PRIMARY KEY (producto_id, etiqueta_id)
);

-- Crear la tabla de pedidos
CREATE TYPE estado_pedido AS ENUM (
    'pendiente',
    'pagado',
    'enviado',
    'entregado',
    'cancelado'
);

CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(255) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES clientes(id),
    nombre_cliente VARCHAR(255) NOT NULL,
    email_cliente VARCHAR(255) NOT NULL,
    telefono_cliente VARCHAR(20),
    direccion_entrega TEXT NOT NULL,
    ciudad_entrega VARCHAR(100) NOT NULL,
    referencia_entrega TEXT,
    metodo_envio VARCHAR(50) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    envio_costo NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    estado estado_pedido DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear la tabla de detalles_pedido
CREATE TABLE detalles_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL
);

-- Crear la tabla de reseñas
CREATE TABLE resenas (
    id SERIAL PRIMARY KEY,
    producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    calificacion NUMERIC(2, 1) CHECK (calificacion >= 1 AND calificacion <= 5) NOT NULL,
    comentario TEXT,
    imagenes TEXT[], -- Array de URLs de ImagenKit
    nombre_cliente VARCHAR(255),
    email_cliente VARCHAR(255),
    aprobada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);
