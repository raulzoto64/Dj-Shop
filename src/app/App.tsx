import { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate as RouterNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import VendedorDashboard from "./VendedorDashboard";
import ProductoPerfilPage from "./ProductoPerfilPage";
import VendedorPerfilPage from "./VendedorPerfilPage";
import AuthPage from "./LoginPage";
import { AuthProvider, useAuth } from "./LoginPage";
import { supabase } from "../lib/supabase.ts";
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  IconButton, Badge, Box, Container, Grid, Card, CardMedia, CardContent,
  CardActions, Button, Chip, TextField, InputAdornment, Drawer, List,
  ListItem, ListItemButton, ListItemText, Divider, FormGroup,
  FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel,
  Stepper, Step, StepLabel, Paper, Snackbar, Alert,
  Breadcrumbs, Link, Rating, Tooltip,
} from "@mui/material";
import {
  Search, ShoppingCart, Menu as MenuIcon, Close, Add, Remove, Delete,
  ArrowForward, CheckCircle, Spa, FilterList, NavigateNext,
  Logout, Store, ChevronLeft, ChevronRight, Chat as ChatIcon,
  AdminPanelSettings,
} from "@mui/icons-material";

const muiTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0f1a0f", paper: "#1a2a1a" },
    primary: { main: "#8b6914", contrastText: "#fff" },
    secondary: { main: "#6b2d5c", contrastText: "#fff" },
    success: { main: "#4caf50" },
    warning: { main: "#ff9800" },
    error: { main: "#f44336" },
    text: { primary: "#e8e8e8", secondary: "#a0a0a0" },
    divider: "rgba(255,255,255,0.1)",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontFamily: "'Montserrat', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Montserrat', sans-serif", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: "#1e2e1e",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 8, fontWeight: 600 },
        containedPrimary: {
          background: "linear-gradient(135deg, #8b6914 0%, #6b2d5c 100%)",
          "&:hover": { background: "linear-gradient(135deg, #a07820 0%, #7d3570 100%)" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: "#1a1a1a",
            "& fieldset": { borderColor: "#444" },
            "&:hover fieldset": { borderColor: "#8b6914" },
            "&.Mui-focused fieldset": { borderColor: "#8b6914" },
          },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: 6 } } },
  },
});

type Category = "hierbas" | "hongos" | "extractos" | "esencias" | "polvos";

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  categoriaNombre?: string;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  descripcion: string;
  stock: number;
  etiquetas: string[];
  peso: string;
  pesoUnidad?: string;
  origen: string;
  rating: number;
  precios?: { cantidad: number; unidad: string; precio: number }[];
}

interface CartItem {
  producto: Producto;
  cantidad: number;
  gramos?: number;
  precioUnitario?: number;
}

const CATEGORY_COLORS: Record<Category, string> = {
  hierbas: "#4caf50", hongos: "#8d6e63", extractos: "#ff9800",
  esencias: "#9c27b0", polvos: "#607d8b",
};

const CATEGORY_LABELS: Record<Category, string> = {
  hierbas: "Hierbas Tradicionales", hongos: "Hongos Funcionales",
  extractos: "Extractos Naturales", esencias: "Esencias Botánicas",
  polvos: "Polvos y Resinas",
};

const CATEGORY_IMAGES: Record<Category, string> = {
  hierbas: "https://images.unsplash.com/photo-1515696955307-c8a57c5d8416?w=600&h=400&fit=crop",
  hongos: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&h=400&fit=crop",
  extractos: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=400&fit=crop",
  esencias: "https://images.unsplash.com/photo-1602524813596-27ea7f2c10dc?w=600&h=400&fit=crop",
  polvos: "https://images.unsplash.com/photo-1606170786765-8d36d9b36e19?w=600&h=400&fit=crop",
};

function mapearProducto(row: Record<string, unknown>): Producto {
  const rawEtiquetas = row.etiquetas;
  const relacion = row.categorias as Record<string, unknown> | null;
  const rawPrecios = row.precios;
  const rawResenas = row.resenas as { calificacion: number }[] | undefined;
  const ratingCalc = Array.isArray(rawResenas) && rawResenas.length > 0
    ? rawResenas.reduce((s, r) => s + (r.calificacion || 0), 0) / rawResenas.length
    : (row.rating as number || 0);
  return {
    id: row.id as number,
    nombre: row.nombre as string,
    categoria: row.categoria_id as string,
    categoriaNombre: relacion?.nombre as string | undefined,
    precio: row.precio as number,
    precioAnterior: row.precio_anterior as number | undefined,
    imagen: row.imagen as string,
    descripcion: row.descripcion as string,
    stock: row.stock as number,
    etiquetas: Array.isArray(rawEtiquetas) ? rawEtiquetas as string[] : [],
    peso: row.peso as string,
    pesoUnidad: row.peso_unidad as string | undefined,
    origen: row.origen as string,
    rating: Math.round(ratingCalc * 10) / 10,
    precios: Array.isArray(rawPrecios) ? (rawPrecios as any[]).map(p => ({
      cantidad: p.cantidad ?? p.gramos ?? 0,
      unidad: p.unidad || "g",
      precio: p.precio,
    })) : undefined,
  };
}

function LoadingSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ textAlign: "center", color: "#a0a0a0" }}>Cargando productos...</Typography>
    </Container>
  );
}

function ProductCard({ producto, onView, onAdd }: { producto: Producto; onView: () => void; onAdd: () => void }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ position: "relative" }}>
        <CardMedia component="img" height="200" image={producto.imagen} alt={producto.nombre} sx={{ objectFit: "cover", aspectRatio: "4/3" }} />
        {producto.precioAnterior && <Chip label="OFERTA" size="small" sx={{ position: "absolute", top: 8, left: 8, background: "#f44336", color: "#fff", fontWeight: 700 }} />}
        {producto.etiquetas.includes("nuevo") && <Chip label="NUEVO" size="small" sx={{ position: "absolute", top: 8, right: 8, background: "#4caf50", color: "#fff", fontWeight: 700 }} />}
        <Chip label={producto.categoriaNombre ?? CATEGORY_LABELS[producto.categoria as Category] ?? producto.categoria} size="small" sx={{ position: "absolute", bottom: 8, left: 8, background: (CATEGORY_COLORS[producto.categoria as Category] ?? "#8b6914") + "cc", color: "#fff", fontSize: "0.7rem" }} />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "#e8e8e8" }}>{producto.nombre}</Typography>
        <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1, fontSize: "0.78rem", lineHeight: 1.4 }}>{producto.descripcion.slice(0, 65)}...</Typography>
        <Rating value={producto.rating} precision={0.1} size="small" readOnly sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>
            {producto.precios && producto.precios.length > 0 ? `Desde S/ ${Math.min(...producto.precios.map(p => p.precio)).toFixed(2)}` : `S/ ${producto.precio.toFixed(2)}`}
          </Typography>
          {producto.precioAnterior && <Typography variant="body2" sx={{ textDecoration: "line-through", color: "#606060" }}>S/ {producto.precioAnterior.toFixed(2)}</Typography>}
        </Box>
        <Typography variant="caption" sx={{ color: producto.stock < 10 ? "#ff9800" : "#4caf50" }}>
          {producto.stock < 10 ? `Solo ${producto.stock} disponibles` : "En stock"}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button size="small" variant="outlined" onClick={onView} sx={{ flex: 1, borderColor: "#444", color: "#a0a0a0" }}>Ver más</Button>
        <Button size="small" variant="contained" onClick={onAdd} sx={{ flex: 1 }}>Agregar</Button>
      </CardActions>
    </Card>
  );
}

interface AppContextType {
  productos: Producto[];
  loading: boolean;
  selectedProduct: Producto | null;
  setSelectedProduct: (p: Producto | null) => void;
  cart: CartItem[];
  addToCart: (p: Producto, gramos?: number, precioUnitario?: number) => void;
  removeFromCart: (id: number, gramos?: number) => void;
  updateCantidad: (id: number, delta: number, gramos?: number) => void;
  filterCategory: string | "all";
  setFilterCategory: (c: string | "all") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  envioForm: { nombre: string; email: string; telefono: string; direccion: string; ciudad: string; referencia: string };
  setEnvioForm: (f: { nombre: string; email: string; telefono: string; direccion: string; ciudad: string; referencia: string }) => void;
  envioErrors: Record<string, string>;
  setEnvioErrors: (e: Record<string, string>) => void;
  checkoutStep: number;
  setCheckoutStep: (s: number) => void;
  cartCount: number;
  subtotal: number;
  total: number;
  envioMontoCosto: number;
  procesando: boolean;
  setProcesando: (v: boolean) => void;
  setConfirmacion: (v: { numero: string; total: number } | null) => void;
  setOrderNumber: (v: string) => void;
  confirmacion: { numero: string; total: number } | null;
  orderNumber: string;
  metodoEnvio: string;
  setMetodoEnvio: (v: string) => void;
  categorias: { id: string; nombre: string }[];
}

export const AppContext = createContext<AppContextType | null>(null);

function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext debe usarse dentro de AppContent");
  return ctx;
}

function HomePage() {
  const navigate = useNavigate();
  const { productos, loading, setSelectedProduct, addToCart, setSearchQuery, setFilterCategory, categorias } = useAppContext();
  const [localSearch, setLocalSearch] = useState("");
  const destacadosRef = useRef<HTMLDivElement>(null);
  const destacados = useMemo(() => {
    const pop = productos.filter(p => p.etiquetas?.includes("popular") || p.etiquetas?.includes("premium"));
    const resultado = pop.length > 0 ? pop.slice(0, 8) : productos.slice(0, 8);
    return resultado;
  }, [productos]);
  if (loading) return <LoadingSkeleton />;
  const scrollDestacados = (dir: "left" | "right") => {
    if (!destacadosRef.current) return;
    const amount = dir === "left" ? -300 : 300;
    destacadosRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };
  return (
    <Box>
      <Box sx={{ minHeight: "90vh", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #0f1a0f 0%, #1b3a1b 40%, #1a1228 100%)", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, opacity: 0.15, backgroundImage: "url(https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=1400&fit=crop)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pb: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, fontWeight: 800, lineHeight: 1.1, mb: 2, color: "#e8e8e8" }}>
                Descubre la<br />
                <span style={{ background: "linear-gradient(135deg, #8b6914, #9c4fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Naturaleza</span>
              </Typography>
              <Typography variant="h6" sx={{ color: "#a0a0a0", mb: 4, fontWeight: 400, maxWidth: 480 }}>Hierbas, hongos funcionales, extractos y esencias botánicas.</Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => { setFilterCategory("all"); navigate("/catalogo"); }} sx={{ px: 4 }}>Ver catálogo</Button>
              </Box>
              <TextField fullWidth placeholder="Buscar productos..." value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setSearchQuery(localSearch); navigate("/catalogo"); } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: "#8b6914" }} /></InputAdornment>,
                  endAdornment: localSearch && <InputAdornment position="end"><Button size="small" variant="contained" onClick={() => { setSearchQuery(localSearch); navigate("/catalogo"); }}>Buscar</Button></InputAdornment> }}
                sx={{ maxWidth: 520 }} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ position: "relative", background: "rgba(0,0,0,0.3)", borderRadius: 3, p: 2, border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: "#8b6914", fontWeight: 700 }}>⭐ PRODUCTOS DESTACADOS</Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small" onClick={() => scrollDestacados("left")} sx={{ color: "#a0a0a0", border: "1px solid #444" }}><ChevronLeft fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => scrollDestacados("right")} sx={{ color: "#a0a0a0", border: "1px solid #444" }}><ChevronRight fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                <Box ref={destacadosRef} sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1, scrollBehavior: "smooth", "&::-webkit-scrollbar": { height: 6 } }}>
                  {destacados.filter(p => p.etiquetas.includes("premium")).slice(0, 4).map(p => (
                    <Box key={p.id} sx={{ minWidth: 140, cursor: "pointer" }} onClick={() => navigate("/producto/" + p.id)}>
                      <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 1, border: "1px solid rgba(255,255,255,0.1)" }}>
                        <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: "#e8e8e8", fontWeight: 600, display: "block", mb: 0.5, fontSize: "0.75rem" }}>{p.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: "#8b6914", fontWeight: 700, fontFamily: "Roboto Mono" }}>
                        {p.precios && p.precios.length > 0 ? `Desde S/ ${Math.min(...p.precios.map((pr: any) => pr.precio)).toFixed(2)}` : `S/ ${p.precio.toFixed(2)}`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" sx={{ textAlign: "center", mb: 5, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>Nuestras Categorías</Typography>
        <Grid container spacing={3}>
          {categorias.map(cat => {
            const catKey = (Object.keys(CATEGORY_LABELS) as Category[]).find(k => CATEGORY_LABELS[k] === cat.nombre);
            const img = catKey ? CATEGORY_IMAGES[catKey] : "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=400&fit=crop";
            return (
              <Grid key={cat.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card sx={{ cursor: "pointer", overflow: "hidden" }} onClick={() => { setFilterCategory(cat.nombre); navigate("/catalogo"); }}>
                  <Box sx={{ position: "relative", height: 200 }}>
                    <CardMedia component="img" image={img} alt={cat.nombre} sx={{ height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "center", color: "#fff" }}>{cat.nombre}</Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>{productos.filter(p => p.categoriaNombre === cat.nombre).length} productos</Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
      <Box sx={{ background: "#111a11", py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}>Productos Destacados</Typography>
            <Button endIcon={<ArrowForward />} onClick={() => navigate("/catalogo")} sx={{ color: "#8b6914" }}>Ver todos</Button>
          </Box>
          <Grid container spacing={3}>
            {destacados.map(p => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ProductCard producto={p} onView={() => navigate("/producto/" + p.id)} onAdd={() => addToCart(p)} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      <Box sx={{ background: "#0a120a", py: 6, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Spa sx={{ color: "#8b6914" }} />
                <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800 }}>BotanikaPE</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#a0a0a0", lineHeight: 1.8 }}>
                Marketplace de productos botánicos naturales seleccionados de la Amazonía y los Andes del Perú.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#8b6914" }}>Categorías</Typography>
              {categorias.map(cat => (
                <Typography key={cat.id} variant="body2" sx={{ color: "#a0a0a0", mb: 0.5, cursor: "pointer", "&:hover": { color: "#8b6914" } }} onClick={() => { setFilterCategory(cat.nombre); navigate("/catalogo"); }}>
                  {cat.nombre}
                </Typography>
              ))}
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#8b6914" }}>Legal</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>Términos y condiciones</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>Política de privacidad</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>Envíos y devoluciones</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#8b6914" }}>Contacto</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>WhatsApp: +51 999 888 777</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>Email: hola@botanikape.com</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Lima, Perú</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="caption" sx={{ color: "#606060", textAlign: "center", display: "block" }}>
            © 2025 BotanikaPE — Proyecto de demostración. Los pagos son simulados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

function CatalogoPage() {
  const navigate = useNavigate();
  const { productos, loading, setSelectedProduct, addToCart, filterCategory, setFilterCategory, categorias } = useAppContext();
  const [localSearch, setLocalSearch] = useState("");
  const [sort, setSort] = useState("nombre");
  const [localCats, setLocalCats] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (filterCategory !== "all") {
      setLocalCats([filterCategory]);
      setFilterCategory("all");
    }
  }, []);

  const filtered = useMemo(() => {
    let list = [...productos];
    if (localCats.length > 0) {
      list = list.filter(p => {
        const catLabel = CATEGORY_LABELS[p.categoria as Category] ?? p.categoria;
        return localCats.includes(p.categoriaNombre ?? catLabel);
      });
    }
    if (localSearch) list = list.filter(p => p.nombre.toLowerCase().includes(localSearch.toLowerCase()) || p.descripcion.toLowerCase().includes(localSearch.toLowerCase()));
    if (sort === "menor") list.sort((a, b) => a.precio - b.precio);
    else if (sort === "mayor") list.sort((a, b) => b.precio - a.precio);
    else if (sort === "nombre") list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [localCats, localSearch, sort, productos]);

  const toggleCat = (c: string) => { setLocalCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]); };

  if (loading) return <LoadingSkeleton />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navigate("/")}>Inicio</Link>
        <Typography color="primary">Catálogo</Typography>
      </Breadcrumbs>

      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField fullWidth placeholder="Buscar productos..." value={localSearch}
          onChange={e => setLocalSearch(e.target.value)} size="small"
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        <Button variant="outlined" startIcon={<FilterList />} onClick={() => setSidebarOpen(true)} sx={{ display: { md: "none" }, minWidth: 100, borderColor: "#444", color: "#a0a0a0" }}>Filtros</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 0, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
          <Paper sx={{ background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, position: "sticky", top: 80, p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Filtrar por</Typography>
            <FormGroup>
              {categorias.map(c => (
                <FormControlLabel key={c.id} control={<Checkbox size="small" checked={localCats.includes(c.nombre)} onChange={() => toggleCat(c.nombre)} sx={{ color: "#8b6914", "&.Mui-checked": { color: "#8b6914" } }} />}
                  label={<Typography variant="body2">{c.nombre}</Typography>} />
              ))}
            </FormGroup>
            <Divider sx={{ my: 2 }} />
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select value={sort} onChange={e => setSort(e.target.value)} label="Ordenar por">
                <MenuItem value="nombre">Nombre A-Z</MenuItem>
                <MenuItem value="menor">Precio menor</MenuItem>
                <MenuItem value="mayor">Precio mayor</MenuItem>
                <MenuItem value="rating">Mejor valorados</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 2 }}>{filtered.length} productos encontrados</Typography>
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography variant="h6" sx={{ color: "#a0a0a0", mb: 2 }}>No se encontraron productos</Typography>
              <Button onClick={() => { setLocalCats([]); setLocalSearch(""); }} sx={{ color: "#8b6914" }}>Limpiar filtros</Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filtered.map(p => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <ProductCard producto={p} onView={() => navigate("/producto/" + p.id)} onAdd={() => addToCart(p)} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} PaperProps={{ sx: { width: 280, background: "#1a2a1a" } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setSidebarOpen(false)}><Close /></IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <FormGroup>
            {categorias.map(c => (
              <FormControlLabel key={c.id} control={<Checkbox size="small" checked={localCats.includes(c.nombre)} onChange={() => toggleCat(c.nombre)} />} label={c.nombre} />
            ))}
          </FormGroup>
        </Box>
        <Box sx={{ p: 2 }}>
          <Button fullWidth variant="contained" onClick={() => setSidebarOpen(false)}>Aplicar filtros</Button>
        </Box>
      </Drawer>
    </Container>
  );
}

function ProductoPage() {
  const navigate = useNavigate();
  const { productos, selectedProduct, setSelectedProduct, addToCart } = useAppContext();
  const p = selectedProduct;
  const [qty, setQty] = useState(1);
  if (!p) return null;
  const relacionados = productos.filter(x => x.categoria === p.categoria && x.id !== p.id).slice(0, 4);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navigate("/")}>Inicio</Link>
        <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navigate("/catalogo")}>Catálogo</Link>
        <Typography color="primary">{p.nombre}</Typography>
      </Breadcrumbs>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <img src={p.imagen} alt={p.nombre} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{p.nombre}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating value={p.rating} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ color: "#a0a0a0" }}>({p.rating})</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700, mb: 2 }}>S/ {p.precio.toFixed(2)}</Typography>
          <Typography variant="body1" sx={{ color: "#c0c0c0", mb: 2 }}>{p.descripcion}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Cantidad:</Typography>
            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #444", borderRadius: 2 }}>
              <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))}><Remove /></IconButton>
              <Typography sx={{ px: 2, fontFamily: "Roboto Mono" }}>{qty}</Typography>
              <IconButton size="small" onClick={() => setQty(q => Math.min(p.stock, q + 1))}><Add /></IconButton>
            </Box>
          </Box>
          <Button variant="contained" size="large" fullWidth onClick={() => { for (let i = 0; i < qty; i++) addToCart(p); }}>Agregar al carrito</Button>
        </Grid>
      </Grid>
      {relacionados.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Productos relacionados</Typography>
          <Grid container spacing={2}>
            {relacionados.map(r => (
              <Grid key={r.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard producto={r} onView={() => { setSelectedProduct(r); navigate("/producto"); }} onAdd={() => addToCart(r)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}

function CarritoPage() {
  const navigate = useNavigate();
  const { cart, updateCantidad, removeFromCart, subtotal, total, envioMontoCosto, cartCount } = useAppContext();
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Tu carrito</Typography>
      {cart.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <ShoppingCart sx={{ fontSize: 80, color: "#333", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#a0a0a0", mb: 2 }}>Tu carrito está vacío</Typography>
          <Button variant="contained" onClick={() => navigate("/catalogo")}>Ver catálogo</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {cart.map(({ producto: p, cantidad, gramos, precioUnitario }) => (
              <Paper key={String(p.id) + "-" + (gramos ?? "0")} sx={{ display: "flex", gap: 2, p: 2, mb: 2, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Box sx={{ width: 90, height: 90, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                  <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.nombre}</Typography>
                  {gramos && <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{gramos}g</Typography>}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: 1 }}>
                      <IconButton size="small" onClick={() => updateCantidad(p.id, -1, gramos)}><Remove /></IconButton>
                      <Typography sx={{ px: 1.5, fontFamily: "Roboto Mono" }}>{cantidad}</Typography>
                      <IconButton size="small" onClick={() => updateCantidad(p.id, 1, gramos)}><Add /></IconButton>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>S/ {((precioUnitario ?? p.precio) * cantidad).toFixed(2)}</Typography>
                    <IconButton size="small" onClick={() => removeFromCart(p.id, gramos)} sx={{ color: "#f44336" }}><Delete /></IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 90 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Resumen</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography>Subtotal ({cartCount} items)</Typography><Typography sx={{ fontFamily: "Roboto Mono" }}>S/ {subtotal.toFixed(2)}</Typography></Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}><Typography>Envío</Typography><Typography sx={{ fontFamily: "Roboto Mono" }}>S/ {envioMontoCosto.toFixed(2)}</Typography></Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography><Typography variant="h6" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>S/ {total.toFixed(2)}</Typography></Box>
              <Button fullWidth variant="contained" size="large" onClick={() => navigate("/checkout")}>Continuar</Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { checkoutStep, setCheckoutStep, envioForm, setEnvioForm, envioErrors, setEnvioErrors, total, procesando, setProcesando, setConfirmacion, setOrderNumber } = useAppContext();
  const steps = ["Datos", "Envío", "Pago"];
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Checkout</Typography>
      <Stepper activeStep={checkoutStep} sx={{ mb: 4, "& .MuiStepLabel-root .Mui-completed": { color: "#8b6914" }, "& .MuiStepLabel-root .Mui-active": { color: "#8b6914" } }}>
        {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
      </Stepper>
      <Paper sx={{ p: { xs: 2, md: 4 }, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
        {checkoutStep === 0 && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Nombre *" value={envioForm.nombre} onChange={e => setEnvioForm({ ...envioForm, nombre: e.target.value })} error={!!envioErrors.nombre} helperText={envioErrors.nombre} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Email *" value={envioForm.email} onChange={e => setEnvioForm({ ...envioForm, email: e.target.value })} error={!!envioErrors.email} helperText={envioErrors.email} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Teléfono *" value={envioForm.telefono} onChange={e => setEnvioForm({ ...envioForm, telefono: e.target.value })} error={!!envioErrors.telefono} /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Dirección *" value={envioForm.direccion} onChange={e => setEnvioForm({ ...envioForm, direccion: e.target.value })} error={!!envioErrors.direccion} multiline rows={2} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Ciudad *" value={envioForm.ciudad} onChange={e => setEnvioForm({ ...envioForm, ciudad: e.target.value })} error={!!envioErrors.ciudad} /></Grid>
            <Grid size={{ xs: 12 }}><Button variant="contained" onClick={() => { const errors: Record<string, string> = {}; if (!envioForm.nombre.trim()) errors.nombre = "Nombre requerido"; if (!envioForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Email inválido"; if (!envioForm.telefono.match(/^9\d{8}$/)) errors.telefono = "Teléfono peruano"; if (!envioForm.direccion.trim()) errors.direccion = "Dirección requerida"; if (!envioForm.ciudad.trim()) errors.ciudad = "Ciudad requerida"; setEnvioErrors(errors); if (Object.keys(errors).length === 0) setCheckoutStep(1); }}>Continuar</Button></Grid>
          </Grid>
        )}
        {checkoutStep === 1 && <EnvioStep />}
        {checkoutStep === 2 && <PagoStep total={total} procesando={procesando} setProcesando={setProcesando} setConfirmacion={setConfirmacion} setOrderNumber={setOrderNumber} />}
      </Paper>
    </Container>
  );
}

function EnvioStep() {
  const { metodoEnvio, setMetodoEnvio, checkoutStep, setCheckoutStep } = useAppContext();
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Método de envío</Typography>
      {[{ value: "standard", label: "Standard", precio: "S/ 15" }, { value: "express", label: "Express", precio: "S/ 25" }].map(opt => (
        <Paper key={opt.value} onClick={() => setMetodoEnvio(opt.value)}
          sx={{ display: "flex", justifyContent: "space-between", p: 2, mb: 2, cursor: "pointer", background: metodoEnvio === opt.value ? "rgba(139,105,20,0.12)" : "#1a2a1a", border: `2px solid ${metodoEnvio === opt.value ? "#8b6914" : "rgba(255,255,255,0.08)"}` }}>
          <Typography>{opt.label}</Typography>
          <Typography sx={{ fontFamily: "Roboto Mono", color: "#8b6914" }}>{opt.precio}</Typography>
        </Paper>
      ))}
      <Button variant="contained" onClick={() => setCheckoutStep(2)}>Continuar al pago</Button>
    </Box>
  );
}

function PagoStep({ total, procesando, setProcesando, setConfirmacion, setOrderNumber }: {
  total: number; procesando: boolean; setProcesando: (v: boolean) => void;
  setConfirmacion: (v: { numero: string; total: number } | null) => void; setOrderNumber: (v: string) => void;
}) {
  const navigate = useNavigate();
  const handlePagar = () => {
    setProcesando(true);
    setTimeout(() => {
      const num = `PE-${Date.now().toString().slice(-8)}`;
      setOrderNumber(num);
      setConfirmacion({ numero: num, total });
      setProcesando(false);
      navigate("/confirmacion");
    }, 2500);
  };
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Pago</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>Total a pagar: <strong>S/ {total.toFixed(2)}</strong></Typography>
      <Button variant="contained" size="large" fullWidth onClick={handlePagar} disabled={procesando}>
        {procesando ? "Procesando..." : `Pagar S/ ${total.toFixed(2)}`}
      </Button>
    </Box>
  );
}

function ConfirmacionPage() {
  const navigate = useNavigate();
  const { confirmacion, orderNumber, total } = useAppContext();
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <CheckCircle sx={{ fontSize: 100, color: "#4caf50", mb: 3 }} />
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>¡Pedido confirmado!</Typography>
      <Typography variant="h5" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", mb: 3, fontWeight: 700 }}>{confirmacion?.numero || orderNumber}</Typography>
      <Typography variant="h4" sx={{ fontFamily: "Roboto Mono", color: "#4caf50", fontWeight: 700, mb: 3 }}>S/ {(confirmacion?.total ?? total).toFixed(2)}</Typography>
      <Button variant="contained" size="large" onClick={() => navigate("/")}>Seguir comprando</Button>
    </Container>
  );
}

function ProtectedAdminRoute() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);
  if (loading) return <Container maxWidth="lg" sx={{ py: 8 }}><Typography variant="h4" sx={{ textAlign: "center", color: "#a0a0a0" }}>Cargando...</Typography></Container>;
  if (!user || !isAdmin) return null;
  return <AdminDashboard onBack={() => navigate("/")} />;
}

function ProtectedVendedorRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);
  if (loading) return <Container maxWidth="lg" sx={{ py: 8 }}><Typography variant="h4" sx={{ textAlign: "center", color: "#a0a0a0" }}>Cargando...</Typography></Container>;
  if (!user) return null;
  return <VendedorDashboard onBack={() => navigate("/")} />;
}

export default function RootApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [envioForm, setEnvioForm] = useState({ nombre: "", email: "", telefono: "", direccion: "", ciudad: "", referencia: "" });
  const [envioErrors, setEnvioErrors] = useState<Record<string, string>>({});
  const [metodoEnvio, setMetodoEnvio] = useState("standard");
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmacion, setConfirmacion] = useState<{ numero: string; total: number } | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("productos").select("*, categorias(nombre), resenas(calificacion)").order("id");
        if (error) throw error;
        if (data) setProductos(data.map((r: Record<string, unknown>) => mapearProducto(r)));
      } catch (e) {
        console.error("Error cargando productos:", e);
      } finally { setLoading(false); }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categorias").select("id, nombre").order("id");
      if (data) setCategorias(data);
    })();
  }, []);

  const addToCart = useCallback((producto: Producto, gramos?: number, precioUnitario?: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.producto.id === producto.id && i.gramos === gramos);
      if (existing) return prev.map(i => i.producto.id === producto.id && i.gramos === gramos ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto, cantidad: 1, gramos, precioUnitario }];
    });
    alert(`${producto.nombre}${gramos ? ` (${gramos}g)` : ""} agregado al carrito`);
  }, []);

  const removeFromCart = (id: number, gramos?: number) => setCart(prev => prev.filter(i => !(i.producto.id === id && i.gramos === gramos)));
  const updateCantidad = (id: number, delta: number, gramos?: number) => {
    setCart(prev => prev.map(i => i.producto.id === id && i.gramos === gramos ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i).filter(i => i.cantidad > 0));
  };
  const cartCount = cart.reduce((s, i) => s + i.cantidad, 0);
  const subtotal = cart.reduce((s, i) => s + (i.precioUnitario ?? i.producto.precio) * i.cantidad, 0);
  const envioMontoCosto = metodoEnvio === "standard" ? 15 : metodoEnvio === "express" ? 25 : 35;
  const total = subtotal + (cart.length > 0 ? envioMontoCosto : 0);

  const ctx: AppContextType = {
    productos, loading, selectedProduct, setSelectedProduct, cart, addToCart, removeFromCart, updateCantidad,
    filterCategory, setFilterCategory, searchQuery, setSearchQuery, envioForm, setEnvioForm, envioErrors, setEnvioErrors,
    checkoutStep, setCheckoutStep, cartCount, subtotal, total, envioMontoCosto, categorias,
    procesando, setProcesando, setConfirmacion, setOrderNumber, confirmacion, orderNumber, metodoEnvio, setMetodoEnvio
  };

  const Header = () => {
    const { user, isAdmin, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
      <AppBar position="sticky" sx={{ background: "rgba(15,26,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => navigate("/")}>
            <Spa sx={{ color: "#8b6914", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800, color: "#e8e8e8", letterSpacing: "-0.5px" }}>
              Botanika<span style={{ color: "#8b6914" }}>PE</span>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user && (
              <IconButton onClick={() => navigate("/vendedor?tab=chat")} sx={{ color: "#a0a0a0" }}>
                <ChatIcon />
              </IconButton>
            )}
            <IconButton onClick={() => navigate("/carrito")} sx={{ color: "#e8e8e8" }}>
              <Badge badgeContent={cartCount} color="warning"><ShoppingCart /></Badge>
            </IconButton>
            <IconButton sx={{ color: "#e8e8e8" }} onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
          </Box>
        </Toolbar>
        <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 260, background: "#1a2a1a" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800, color: "#e8e8e8" }}>Menú</Typography>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "#a0a0a0" }}><Close /></IconButton>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setMobileOpen(false); navigate("/catalogo"); }}>
                <ListItemText primary="Catálogo" />
              </ListItemButton>
            </ListItem>
            {categorias.map(c => (
              <ListItem key={c.id} disablePadding>
                <ListItemButton onClick={() => { setMobileOpen(false); setFilterCategory(c.nombre); navigate("/catalogo"); }}>
                  <ListItemText primary={c.nombre} sx={{ pl: 2 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
          {user && (
            <List>
              {isAdmin && (
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { setMobileOpen(false); navigate("/admin"); }}>
                    <AdminPanelSettings sx={{ mr: 1, color: "#8b6914" }} />
                    <ListItemText primary="Admin" sx={{ color: "#8b6914" }} />
                  </ListItemButton>
                </ListItem>
              )}
              <ListItem disablePadding>
                <ListItemButton onClick={() => { setMobileOpen(false); navigate("/vendedor"); }}>
                  <Store sx={{ mr: 1, color: "#a0a0a0" }} />
                  <ListItemText primary="Mi Tienda" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { setMobileOpen(false); logout(); }}>
                  <Logout sx={{ mr: 1, color: "#f44336" }} />
                  <ListItemText primary="Cerrar sesión" sx={{ color: "#f44336" }} />
                </ListItemButton>
              </ListItem>
            </List>
          )}
        </Drawer>
      </AppBar>
    );
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Header />
      <Box component="main" sx={{ minHeight: "80vh" }}>
        <AppContext.Provider value={ctx}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/producto" element={<ProductoPage />} />
            <Route path="/producto/:id" element={<ProductoPerfilPage />} />
            <Route path="/carrito" element={<CarritoPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmacion" element={<ConfirmacionPage />} />
            <Route path="/auth" element={<AuthPage onBack={() => navigate("/")} />} />
            <Route path="/admin" element={<ProtectedAdminRoute />} />
            <Route path="*" element={<RouterNavigate to="/" replace />} />
          <Route path="/vendedor" element={<ProtectedVendedorRoute />} />
          <Route path="/tienda" element={<ProtectedVendedorRoute />} />
          <Route path="/tienda/:id" element={<VendedorPerfilPage />} />
          </Routes>
        </AppContext.Provider>
      </Box>

    </ThemeProvider>
  );
}