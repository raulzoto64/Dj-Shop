# Configuración Inicial de Supabase

## Paso 1: Ejecutar SQL de roles

Abre el **SQL Editor** en tu dashboard de Supabase y ejecuta el contenido de `supabase/08_agregar_rol_admin.sql` para:
- Agregar la columna `rol` a la tabla `clientes`
- Crear constraint CHECK para que aparezca como desplegable
- Crear índice para consultas por rol
- Crear usuario admin de prueba

## Paso 2: Ejecutar SQL de RLS corregido

Ejecuta el contenido de `supabase/09_corregir_rls_clientes.sql` en el SQL Editor de Supabase para ajustar las políticas RLS y permitir el acceso directo a la tabla `clientes` (autenticación custom).

## Paso 3: Ejecutar SQL de vendedores y chat

Ejecuta el contenido de `supabase/10_sistema_vendedores_chat.sql` en el SQL Editor de Supabase para:
- Agregar columnas `usuario_id` a `productos` y `categorias`
- Crear tabla `vendedores` (perfiles de tienda)
- Crear tablas `conversaciones` y `mensajes` (sistema de chat)
- Agregar columnas de imagen/video a `resenas`
- Modificar tabla `etiquetas` para soportar creadas por usuarios
- Crear triggers para actualizar rating de vendedores
- Crear políticas RLS nuevas

## Paso 4: Quitar permisos de escritura (modo solo lectura)

Ejecuta el contenido de `supabase/11_quitar_permisos.sql` en el SQL Editor de Supabase para:
- Eliminar TODOS los permisos de INSERT/UPDATE/DELETE de: `categorias`, `productos`, `resenas`, `mensajes`, `etiquetas`, `producto_etiquetas`, `vendedores`, `conversaciones`, `pedidos`, `detalles_pedido`
- Solo permite SELECT (lectura pública) en casi todas las tablas
- Mantiene el registro de clientes (INSERT público) y actualización propia
- **Importante:** Si necesitas crear datos de prueba, ejecuta este Paso 4 DESPUÉS de crearlos, o usa el SQL Editor directamente con permisos de admin

## Roles Disponibles

### 1. Admin (`admin`)
- Acceso al panel de administración (`/admin`)
- Puede ver y editar todos los usuarios
- Puede cambiar roles de otros usuarios
- Puede activar/desactivar usuarios
- Acceso completo a categorías y productos

### 2. Vendedor (`vendedor`)
- Acceso al panel de vendedor (`/vendedor` o `/tienda`)
- Puede crear/editar sus propios productos
- Puede crear/editar sus propias categorías
- Puede crear etiquetas personalizadas
- Puede chatear con otros usuarios
- Puede ver sus reseñas

### 3. Usuario (`usuario`) - Por defecto
- Puede navegar la tienda
- Puede agregar productos al carrito
- Puede comprar (checkout simulado)
- Puede crear reseñas con imagen/video
- No tiene acceso a dashboards

## Cómo Cambiar Roles

1. Inicia sesión como admin
2. Ve a `/admin`
3. Haz clic en la pestaña **"Usuarios"**
4. Verás una tabla con todos los usuarios
5. En la columna **"Rol"** encontrarás un desplegable con 3 opciones:
   - **Admin** (dorado)
   - **Vendedor** (púrpura)
   - **Usuario** (gris)
6. Selecciona el rol deseado para cada usuario
7. También puedes activar/desactivar usuarios con el switch

## Usuario Admin de Prueba

Después de ejecutar `08_agregar_rol_admin.sql`:
- **Email:** `admin@botanikape.com`
- **Password:** `admin123`
- **Rol:** `admin`

## Flujo Normal

1. Usuario se registra en `/auth` → se crea en tabla `clientes` con `rol = 'usuario'`
2. Admin cambia el rol a `'vendedor'` desde la pestaña Usuarios en `/admin`
3. Vendedor accede a `/vendedor` y gestiona sus productos/categorías
4. Usuarios normales pueden ver los productos del vendedor
5. Usuarios pueden dejar reseñas (con imagen/video) a los vendedores

## Características Adicionales

- **Chat en tiempo real** entre usuarios
- **Alertas de mensajes sin leer** en el dashboard de vendedor
- **Reseñas con imagen y video** (YouTube)
- **Etiquetas personalizadas** por usuario
- **Rating automático** de vendedores basado en reseñas

## Nota Importante

En producción, deberías:
- Reactivar la confirmación de email en Supabase
- Usar bcrypt para las contraseñas (actualmente base64 para demo)
- Implementar validaciones más robustas
- Configurar CORS y políticas de seguridad adicionales