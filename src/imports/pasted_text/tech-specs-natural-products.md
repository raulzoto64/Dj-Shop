Aquí tienes el **documento de especificaciones técnicas completo** listo para copiar y pegarle a cualquier IA generadora de código:

---

# 📋 DOCUMENTO DE ESPECIFICACIONES TÉCNICAS
## Proyecto: Marketplace de Productos Botánicos Naturales

**Tipo:** Aplicación Web Full-Stack (Frontend + Backend simulado con LocalStorage)  
**Tecnología:** HTML5, CSS3, JavaScript Vanilla (SPA - Single Page Application)  
**Responsive:** Mobile-first, tablet, desktop  
**Ubicación:** Perú (envíos a nivel nacional)

---

## 🎯 OBJETIVO DEL PROYECTO

Crear una tienda marketplace de productos naturales/botánicos con 5 categorías principales, sistema de búsqueda avanzado, carrito de compras, checkout con geolocalización para Perú, y pasarela de pagos simulada.

---

## 🏗️ ARQUITECTURA DE PÁGINAS

### 1. PÁGINA: HOME (`index.html`)
**Ruta:** `/`

**Secciones obligatorias:**
- **Header sticky:** Logo + menú hamburguesa (móvil) + iconos (búsqueda, carrito con contador, usuario)
- **Hero section:** Imagen de fondo oscuro con degradado + título "Descubre la naturaleza" + CTA "Ver catálogo" + buscador central grande
- **Categorías grid:** 5 cards grandes con imágenes de fondo:
  - Hierbas Tradicionales
  - Hongos Funcionales  
  - Extractos Naturales
  - Esencias Botánicas
  - Polvos y Resinas
- **Productos destacados:** Grid de 8 productos (2 filas x 4 columnas desktop) con: imagen, nombre, precio, badge "Disponible", botón "Agregar"
- **Beneficios:** 4 íconos (Envío discreto, Pagos seguros, Atención 24/7, Calidad premium)
- **Footer:** Links de categorías, contacto, redes sociales, método de pago

### 2. PÁGINA: CATÁLOGO (`catalogo.html`)
**Ruta:** `/catalogo.html` (reutilizable para todas las categorías)

**Parámetros URL:** `?categoria=hierbas|hongos|extractos|esencias|polvos`

**Elementos:**
- Breadcrumb navegación
- **Sidebar izquierda (desktop) / Dropdown (móvil):**
  - Filtro por categoría (checkboxes)
  - Rango de precio (slider min-max)
  - Ordenar por: Precio menor/mayor, Más vendidos, Nombre A-Z
- **Buscador prominente:** Barra de búsqueda con autocompletado (busca en nombre y descripción)
- **Grid de productos:** 3-4 columnas desktop, 2 tablet, 1 móvil
- **Paginación:** 12 productos por página
- **Vista rápida:** Modal al hacer hover/click en producto

### 3. PÁGINA: DETALLE DE PRODUCTO (`producto.html`)
**Ruta:** `/producto.html?id=123`

**Elementos:**
- Galería de imágenes (principal + thumbnails)
- Nombre del producto
- Categoría (badge)
- Precio (tachado si hay descuento + precio final)
- Selector de cantidad (+/-)
- Botón "Agregar al carrito" (primario) + "Comprar ahora" (secundario)
- Tabs: Descripción | Información adicional | Envíos
- Productos relacionados (misma categoría, 4 items)

### 4. PÁGINA: CARRITO (`carrito.html`)
**Ruta:** `/carrito.html`

**Elementos:**
- Lista de items con: imagen miniatura, nombre, precio unitario, selector cantidad, subtotal, botón eliminar
- Resumen orden: Subtotal, Costo envío (calculado por ciudad), Total
- Botón "Continuar compra" → redirige a checkout

### 5. PÁGINA: CHECKOUT (`checkout.html`)
**Ruta:** `/checkout.html`

**Formulario en 3 pasos (wizard):**

**Paso 1 - Datos de envío:**
- Nombre completo
- Email
- Teléfono
- **Select de Departamentos de Perú** (Lima, Arequipa, Cusco, etc.)
- **Select de Provincias** (carga dinámica según departamento)
- **Select de Distritos** (carga dinámica según provincia)
- Dirección exacta (textarea)
- Referencia (opcional)

**Paso 2 - Método de envío:**
- Opciones: Standard (3-5 días), Express (24-48h), Discreto Premium
- Costos calculados según ciudad

**Paso 3 - Pago:**
- Opciones: Tarjeta de crédito/débito, Yape, Plin, Transferencia bancaria
- Formulario tarjeta: Número, fecha vencimiento, CVV, nombre titular
- Checkbox "Guardar datos para futuras compras"

**Confirmación:** Resumen final con botón "Pagar S/ XXX"

### 6. PÁGINA: CONFIRMACIÓN (`confirmacion.html`)
**Ruta:** `/confirmacion.html`

- Mensaje de éxito con ícono verde
- Número de pedido generado automáticamente
- Resumen de compra
- Botón "Seguir comprando"

---

## 🎨 ESPECIFICACIONES DE DISEÑO

### Paleta de colores (tema "Selva Natural"):
```css
--primary-dark: #1b3a1b;      /* Verde bosque profundo */
--primary: #2d5a2d;             /* Verde selva */
--secondary: #8b6914;           /* Dorado tierra */
--accent: #6b2d5c;            /* Púrpura natural */
--accent-light: #9c4fa0;       /* Lavanda oscuro */
--bg-primary: #0f1a0f;          /* Fondo casi negro verdoso */
--bg-secondary: #1a2f1a;       /* Verde oscuro */
--bg-card: #242424;             /* Gris oscuro cálido */
--text-primary: #e8e8e8;       /* Blanco hueso */
--text-secondary: #a0a0a0;       /* Gris claro */
--success: #4caf50;
--warning: #ff9800;
--error: #f44336;
```

### Tipografía:
- **Títulos:** Montserrat o Poppins (Bold/SemiBold)
- **Body:** Inter o Open Sans (Regular/Medium)
- **Precios:** Roboto Mono (monospace para alineación)

### Componentes UI:
- **Botones primarios:** Fondo degradado (verde a púrpura), texto blanco, bordes redondeados 8px, sombra suave
- **Cards:** Fondo `#242424`, borde 1px `#333`, esquinas redondeadas 12px, sombra interna sutil
- **Inputs:** Fondo `#1a1a1a`, borde `#444`, texto blanco, focus con borde púrpura
- **Badges categorías:** Colores distintivos por categoría:
  - Hierbas: Verde `#4caf50`
  - Hongos: Marrón `#8d6e63`
  - Extractos: Ámbar `#ff9800`
  - Esencias: Púrpura `#9c27b0`
  - Polvos: Azul grisáceo `#607d8b`

---

## ⚙️ FUNCIONALIDADES TÉCNICAS REQUERIDAS

### Sistema de Datos (Mock Database):
Crear un array de objetos JavaScript con al menos 30 productos:

```javascript
const productos = [
  {
    id: 1,
    nombre: "Producto Ejemplo",
    categoria: "hierbas", // hierbas | hongos | extractos | esencias | polvos
    precio: 150.00,
    precioAnterior: 180.00,
    imagen: "url-imagen",
    descripcion: "Descripción detallada...",
    stock: 15,
    etiquetas: ["popular", "nuevo"],
    peso: "50g",
    origen: "Perú"
  }
  // ... 29 más
];
```

### Funcionalidades JavaScript:

1. **Sistema de búsqueda:**
   - Búsqueda en tiempo real (debounce 300ms)
   - Busca en nombre y descripción
   - Resultados instantáneos sin recarga

2. **Filtros dinámicos:**
   - Filtrar por categoría (checkbox múltiple)
   - Filtrar por rango de precio (min-max)
   - Ordenar resultados (sort)
   - Combinación de filtros (AND lógico)

3. **Carrito de compras:**
   - LocalStorage para persistencia
   - Agregar/eliminar/actualizar cantidad
   - Cálculo automático de totales
   - Contador en icono de header (actualización en tiempo real)
   - Prevención de duplicados (sumar cantidad si ya existe)

4. **Geolocalización Perú:**
   - Objeto con datos de Departamentos > Provincias > Distritos
   - Selects anidados (cascade dropdowns)
   - Cálculo de envío según departamento:
     - Lima: S/ 15
     - Provincia cercana: S/ 25
     - Provincia lejana: S/ 35

5. **Pasarela de pago simulada:**
   - Validación de campos de tarjeta (Luhn algorithm básico)
   - Spinner de carga 3 segundos
   - Redirección a confirmación con número de pedido aleatorio

6. **URL Parameters:**
   - Leer/escribir parámetros de URL para compartir filtros
   - `?categoria=hongos&precio_max=200&orden=menor_precio`

7. **Responsive:**
   - Menú hamburguesa con animación
   - Grid adaptable (CSS Grid + Flexbox)
   - Touch-friendly en móvil
   - Optimización de imágenes

---

## 📱 NAVEGACIÓN Y MENÚ

**Menú principal (header):**
- Logo (izquierda)
- Links: Inicio | Catálogo ▼ (dropdown con 5 categorías) | Contacto
- Iconos derecha: 🔍 Búsqueda | 🛒 Carrito (badge contador) | 👤 Cuenta

**Menú móvil (drawer):**
- Slide desde derecha
- Mismo contenido que desktop
- Cerrar con X o click fuera

**Footer links:**
- Categorías (5 links)
- Términos y condiciones
- Política de privacidad
- Contacto WhatsApp
- Redes sociales

---

## 🖼️ ASSETS VISUALES

**Imágenes placeholder:** Usar placeholder.com o picsum.photos con temática:
- Hierbas: tonos verdes, naturaleza
- Hongos: tierra, bosque
- Extractos: frascos, naturaleza
- Esencias: púrpuras, misticismo
- Polvos: texturas, tierra

**Iconos:** Font Awesome 6 (CDN) o Heroicons
- `fa-leaf` (hierbas)
- `fa-mushroom` (hongos)
- `fa-flask` (extractos)
- `fa-spa` (esencias)
- `fa-mortar-pestle` (polvos)

---

## 🔒 CONSIDERACIONES TÉCNICAS

1. **Validaciones:**
   - Campos obligatorios en checkout
   - Formato email válido
   - Teléfono peruano (9 dígitos, empieza con 9)
   - Stock disponible (no permitir agregar más de lo existente)

2. **UX/UI:**
   - Toast notifications (agregado al carrito, error, éxito)
   - Loading states en botones
   - Hover effects en cards (elevación + brillo sutil)
   - Smooth scroll behavior
   - Skeleton loading para imágenes

3. **SEO básico:**
   - Meta tags descriptivos
   - Open Graph tags
   - Alt text en imágenes
   - URLs amigables (simuladas con parámetros)

4. **Seguridad frontend:**
   - Sanitizar inputs (prevenir XSS básico)
   - No almacenar datos sensibles reales en LocalStorage

---

## 📦 ENTREGABLES ESPERADOS

La IA debe generar:
1. `index.html` - Home completa
2. `catalogo.html` - Página de catálogo con filtros
3. `producto.html` - Template de detalle
4. `carrito.html` - Vista de carrito
5. `checkout.html` - Formulario de pago
6. `confirmacion.html` - Página de éxito
7. `css/styles.css` - Estilos completos (un solo archivo)
8. `js/app.js` - Toda la lógica JavaScript (un solo archivo)
9. Datos de provincias/perú en JSON dentro del JS

**Extras opcionales:**
- Modo oscuro/claro (toggle)
- Animaciones de entrada (fade in, slide up)
- PWA básica (manifest.json)
- Service worker para offline

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Diseño 100% responsive (testear en 320px, 768px, 1024px, 1440px)
- [ ] Búsqueda funciona en home y catálogo
- [ ] Filtros combinados funcionan correctamente
- [ ] Carrito persiste al recargar página
- [ ] Checkout calcula envío según ciudad de Perú
- [ ] Animaciones suaves (60fps)
- [ ] Código comentado y estructurado
- [ ] Sin errores en consola
- [ ] Contraste de colores accesible (WCAG AA)

---

**Nota para el desarrollador:** Este es un proyecto de demostración/prototipo. Usar datos ficticios. La pasarela de pagos es simulada (no procesa pagos reales).

---

Copia este documento completo y pégaselo a Claude, ChatGPT, Gemini o cualquier IA generadora de código con la instrucción: **"Genera el código completo de esta tienda marketplace basándote en estas especificaciones técnicas detalladas"**.