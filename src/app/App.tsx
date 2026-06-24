import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Rating,
  Skeleton,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Search,
  ShoppingCart,
  Person,
  Menu as MenuIcon,
  Close,
  Add,
  Remove,
  Delete,
  LocalShipping,
  Security,
  SupportAgent,
  Star,
  ArrowForward,
  CheckCircle,
  Spa,
  Science,
  Grass,
  FilterList,
  NavigateNext,
  KeyboardArrowUp,
} from "@mui/icons-material";

// ─── THEME ─────────────────────────────────────────────────────────────────
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

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
type Category = "hierbas" | "hongos" | "extractos" | "esencias" | "polvos";

interface Producto {
  id: number;
  nombre: string;
  categoria: Category;
  precio: number;
  precioAnterior?: number;
  imagen: string;
  descripcion: string;
  stock: number;
  etiquetas: string[];
  peso: string;
  origen: string;
  rating: number;
}

const PRODUCTOS: Producto[] = [
  { id: 1, nombre: "Muña Andina Premium", categoria: "hierbas", precio: 28, precioAnterior: 35, imagen: "https://images.unsplash.com/photo-1600781831924-a66a8e7a1e97?w=400&h=300&fit=crop", descripcion: "Hierba aromática del altiplano peruano, ideal para digestión y altura.", stock: 20, etiquetas: ["popular"], peso: "50g", origen: "Cusco", rating: 4.8 },
  { id: 2, nombre: "Chanca Piedra Orgánica", categoria: "hierbas", precio: 35, imagen: "https://images.unsplash.com/photo-1515696955307-c8a57c5d8416?w=400&h=300&fit=crop", descripcion: "Poderosa hierba para el sistema renal. 100% orgánica.", stock: 15, etiquetas: ["nuevo"], peso: "60g", origen: "Amazonas", rating: 4.6 },
  { id: 3, nombre: "Uña de Gato Selvática", categoria: "hierbas", precio: 42, precioAnterior: 50, imagen: "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400&h=300&fit=crop", descripcion: "Extracto de la enredadera amazónica con propiedades antiinflamatorias.", stock: 8, etiquetas: ["popular", "oferta"], peso: "40g", origen: "Loreto", rating: 4.9 },
  { id: 4, nombre: "Maca Negra Andina", categoria: "hierbas", precio: 55, imagen: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&h=300&fit=crop", descripcion: "Variedad rara de maca negra, energizante natural del altiplano.", stock: 12, etiquetas: ["premium"], peso: "100g", origen: "Junín", rating: 4.7 },
  { id: 5, nombre: "Reishi Rojo Orgánico", categoria: "hongos", precio: 89, precioAnterior: 110, imagen: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=400&h=300&fit=crop", descripcion: "El hongo de la inmortalidad. Adaptógeno y modulador inmunológico.", stock: 18, etiquetas: ["popular", "premium"], peso: "30g", origen: "Importado", rating: 5.0 },
  { id: 6, nombre: "Lion's Mane Liofilizado", categoria: "hongos", precio: 75, imagen: "https://images.unsplash.com/photo-1591213954196-2d0ccb3f8d4c?w=400&h=300&fit=crop", descripcion: "Hongo melena de león para función cognitiva y neurológica.", stock: 10, etiquetas: ["nuevo"], peso: "25g", origen: "Importado", rating: 4.8 },
  { id: 7, nombre: "Chaga Siberiano", categoria: "hongos", precio: 95, precioAnterior: 120, imagen: "https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=400&h=300&fit=crop", descripcion: "Rey de los hongos adaptógenos. Rico en betaglucanos.", stock: 6, etiquetas: ["oferta"], peso: "20g", origen: "Importado", rating: 4.7 },
  { id: 8, nombre: "Cordyceps Militaris", categoria: "hongos", precio: 110, imagen: "https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=400&h=300&fit=crop", descripcion: "Hongo energizante atlético. Mejora el rendimiento físico.", stock: 14, etiquetas: ["premium"], peso: "15g", origen: "Importado", rating: 4.9 },
  { id: 9, nombre: "Extracto Sangre de Grado", categoria: "extractos", precio: 48, precioAnterior: 60, imagen: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=300&fit=crop", descripcion: "Resina roja del árbol Croton lechleri. Cicatrizante y antiviral.", stock: 22, etiquetas: ["popular"], peso: "30ml", origen: "Ucayali", rating: 4.8 },
  { id: 10, nombre: "Extracto de Cat's Claw 10:1", categoria: "extractos", precio: 65, imagen: "https://images.unsplash.com/photo-1559181567-c3190ca9d6e7?w=400&h=300&fit=crop", descripcion: "Extracto concentrado 10:1 de uña de gato amazónica.", stock: 9, etiquetas: ["premium"], peso: "50ml", origen: "Pucallpa", rating: 4.6 },
  { id: 11, nombre: "Extracto Hercampuri", categoria: "extractos", precio: 38, imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop", descripcion: "Planta amarga para el hígado. Depurativo y hepatoprotector.", stock: 16, etiquetas: ["nuevo"], peso: "40ml", origen: "Arequipa", rating: 4.5 },
  { id: 12, nombre: "Tintura Valeriana Nativa", categoria: "extractos", precio: 32, precioAnterior: 40, imagen: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop", descripcion: "Extracto de raíz de valeriana andina. Relajante y ansiolítico.", stock: 25, etiquetas: ["oferta"], peso: "60ml", origen: "Cajamarca", rating: 4.7 },
  { id: 13, nombre: "Esencia de Palo Santo", categoria: "esencias", precio: 58, imagen: "https://images.unsplash.com/photo-1602524813596-27ea7f2c10dc?w=400&h=300&fit=crop", descripcion: "Aceite esencial sagrado del Bursera graveolens peruano.", stock: 30, etiquetas: ["popular"], peso: "10ml", origen: "Piura", rating: 4.9 },
  { id: 14, nombre: "Aceite de Copaiba", categoria: "esencias", precio: 72, precioAnterior: 85, imagen: "https://images.unsplash.com/photo-1612545812256-dfaa13a1a0ac?w=400&h=300&fit=crop", descripcion: "Resina oleosa de copaiba. Antiinflamatorio y aromatizante.", stock: 11, etiquetas: ["premium", "oferta"], peso: "15ml", origen: "Madre de Dios", rating: 4.8 },
  { id: 15, nombre: "Esencia de Ayahuasca (Legal)", categoria: "esencias", precio: 120, imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", descripcion: "Mezcla aromática legal de plantas del ritual. Sin DMT.", stock: 5, etiquetas: ["premium"], peso: "5ml", origen: "Iquitos", rating: 5.0 },
  { id: 16, nombre: "Aceite Esencial de Muña", categoria: "esencias", precio: 45, imagen: "https://images.unsplash.com/photo-1556909114-44e3e9399a2b?w=400&h=300&fit=crop", descripcion: "Destilado de vapor de muña andina. Mentolado y refrescante.", stock: 18, etiquetas: ["nuevo"], peso: "10ml", origen: "Puno", rating: 4.6 },
  { id: 17, nombre: "Polvo de Lucuma Premium", categoria: "polvos", precio: 32, precioAnterior: 38, imagen: "https://images.unsplash.com/photo-1606170786765-8d36d9b36e19?w=400&h=300&fit=crop", descripcion: "Superfruta peruana deshidratada. Endulzante natural y nutritivo.", stock: 35, etiquetas: ["popular"], peso: "200g", origen: "La Libertad", rating: 4.7 },
  { id: 18, nombre: "Camu Camu en Polvo", categoria: "polvos", precio: 48, imagen: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop", descripcion: "Mayor fuente natural de vitamina C. Sabor ácido exquisito.", stock: 20, etiquetas: ["popular", "nuevo"], peso: "100g", origen: "Loreto", rating: 4.8 },
  { id: 19, nombre: "Polvo de Maca Gelatinizada", categoria: "polvos", precio: 42, precioAnterior: 55, imagen: "https://images.unsplash.com/photo-1615485925763-86d4db5eddec?w=400&h=300&fit=crop", descripcion: "Maca gelatinizada para mejor absorción. Energía y libido.", stock: 28, etiquetas: ["oferta"], peso: "250g", origen: "Pasco", rating: 4.6 },
  { id: 20, nombre: "Ashwagandha KSM-66", categoria: "polvos", precio: 78, imagen: "https://images.unsplash.com/photo-1563228911-4c1d6f5e4e18?w=400&h=300&fit=crop", descripcion: "Extracto patentado de raíz de ashwagandha. Adaptógeno supremo.", stock: 13, etiquetas: ["premium"], peso: "100g", origen: "Importado", rating: 4.9 },
  { id: 21, nombre: "Boldo Chileno-Peruano", categoria: "hierbas", precio: 18, imagen: "https://images.unsplash.com/photo-1502977649367-cbb7e7a2de97?w=400&h=300&fit=crop", descripcion: "Hierba digestiva tradicional. Protege el hígado y la vesícula.", stock: 40, etiquetas: [], peso: "80g", origen: "Arequipa", rating: 4.3 },
  { id: 22, nombre: "Hierba Luisa Orgánica", categoria: "hierbas", precio: 15, imagen: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&h=300&fit=crop", descripcion: "Aromática y digestiva. Perfecta para infusiones relajantes.", stock: 50, etiquetas: [], peso: "60g", origen: "Ica", rating: 4.4 },
  { id: 23, nombre: "Shiitake Liofilizado", categoria: "hongos", precio: 55, imagen: "https://images.unsplash.com/photo-1561835491-ed5f4e831b2f?w=400&h=300&fit=crop", descripcion: "Hongo del Este culinario-medicinal. Inmunológico y umami.", stock: 22, etiquetas: ["nuevo"], peso: "30g", origen: "Importado", rating: 4.5 },
  { id: 24, nombre: "Extracto Andrographis", categoria: "extractos", precio: 55, imagen: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop", descripcion: "Extracto antiviral e inmunoestimulante. Conocida como la espina de loto.", stock: 7, etiquetas: ["nuevo"], peso: "30ml", origen: "Importado", rating: 4.6 },
  { id: 25, nombre: "Esencia Cedro Amazónico", categoria: "esencias", precio: 38, precioAnterior: 48, imagen: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop", descripcion: "Aceite de cedro amazónico puro. Armonizante y terroso.", stock: 15, etiquetas: ["oferta"], peso: "10ml", origen: "Huánuco", rating: 4.5 },
  { id: 26, nombre: "Polvo de Sacha Inchi", categoria: "polvos", precio: 36, imagen: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&h=300&fit=crop", descripcion: "Proteína vegetal completa con omega 3, 6 y 9. Superalimento peruano.", stock: 33, etiquetas: ["popular"], peso: "200g", origen: "San Martín", rating: 4.7 },
  { id: 27, nombre: "Guayusa Amazónica", categoria: "hierbas", precio: 30, imagen: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop", descripcion: "Planta energizante del Amazonas. Rica en cafeína y antioxidantes.", stock: 18, etiquetas: ["nuevo"], peso: "70g", origen: "Amazonas", rating: 4.6 },
  { id: 28, nombre: "Polvo de Yacón", categoria: "polvos", precio: 28, imagen: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=300&fit=crop", descripcion: "Prebiótico natural. Ideal para diabéticos y control de peso.", stock: 24, etiquetas: [], peso: "150g", origen: "Cajamarca", rating: 4.4 },
  { id: 29, nombre: "Hongo Maitake Polvo", categoria: "hongos", precio: 68, imagen: "https://images.unsplash.com/photo-1600431521340-491eca880813?w=400&h=300&fit=crop", descripcion: "Hongo danzante. Regula glucosa, colesterol e inmunidad.", stock: 9, etiquetas: ["premium"], peso: "25g", origen: "Importado", rating: 4.7 },
  { id: 30, nombre: "Aceite Mapacho Tabaco", categoria: "esencias", precio: 65, imagen: "https://images.unsplash.com/photo-1616432052254-8c1a3b0f4b88?w=400&h=300&fit=crop", descripcion: "Aceite sagrado del tabaco mapacho amazónico. Uso ceremonial.", stock: 4, etiquetas: ["premium"], peso: "5ml", origen: "Loreto", rating: 4.9 },
];

type Page = "home" | "catalogo" | "producto" | "carrito" | "checkout" | "confirmacion";

interface CartItem { producto: Producto; cantidad: number; }

const CATEGORY_COLORS: Record<Category, string> = {
  hierbas: "#4caf50",
  hongos: "#8d6e63",
  extractos: "#ff9800",
  esencias: "#9c27b0",
  polvos: "#607d8b",
};

const CATEGORY_LABELS: Record<Category, string> = {
  hierbas: "Hierbas Tradicionales",
  hongos: "Hongos Funcionales",
  extractos: "Extractos Naturales",
  esencias: "Esencias Botánicas",
  polvos: "Polvos y Resinas",
};

const CATEGORY_IMAGES: Record<Category, string> = {
  hierbas: "https://images.unsplash.com/photo-1515696955307-c8a57c5d8416?w=600&h=400&fit=crop",
  hongos: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&h=400&fit=crop",
  extractos: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=400&fit=crop",
  esencias: "https://images.unsplash.com/photo-1602524813596-27ea7f2c10dc?w=600&h=400&fit=crop",
  polvos: "https://images.unsplash.com/photo-1606170786765-8d36d9b36e19?w=600&h=400&fit=crop",
};

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmacion, setConfirmacion] = useState<{ numero: string; total: number } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [envioForm, setEnvioForm] = useState({
    nombre: "", email: "", telefono: "",
    direccion: "", ciudad: "", referencia: "",
  });
  const [envioErrors, setEnvioErrors] = useState<Record<string, string>>({});
  const [metodoEnvio, setMetodoEnvio] = useState("standard");
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [pagoForm, setPagoForm] = useState({ numero: "", vencimiento: "", cvv: "", titular: "" });
  const [procesando, setProcesando] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.cantidad, 0);
  const subtotal = cart.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);
  const envioMontoCosto = metodoEnvio === "standard" ? 15 : metodoEnvio === "express" ? 25 : 35;
  const total = subtotal + (cart.length > 0 ? envioMontoCosto : 0);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = useCallback((producto: Producto) => {
    setCart(prev => {
      const existing = prev.find(i => i.producto.id === producto.id);
      if (existing) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { producto, cantidad: 1 }];
    });
    setSnackbar({ open: true, msg: `${producto.nombre} agregado al carrito`, severity: "success" });
  }, []);

  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.producto.id !== id));
  const updateCantidad = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i).filter(i => i.cantidad > 0));
  };

  const navTo = (p: Page) => { setPage(p); window.scrollTo(0, 0); };

  const validateEnvio = () => {
    const errors: Record<string, string> = {};
    if (!envioForm.nombre.trim()) errors.nombre = "Nombre requerido";
    if (!envioForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Email inválido";
    if (!envioForm.telefono.match(/^9\d{8}$/)) errors.telefono = "Teléfono peruano (9 dígitos, empieza con 9)";
    if (!envioForm.direccion.trim()) errors.direccion = "Dirección requerida";
    if (!envioForm.ciudad.trim()) errors.ciudad = "Ciudad requerida";
    setEnvioErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePagar = () => {
    setProcesando(true);
    setTimeout(() => {
      const num = `PE-${Date.now().toString().slice(-8)}`;
      setOrderNumber(num);
      setConfirmacion({ numero: num, total });
      setCart([]);
      setProcesando(false);
      navTo("confirmacion");
    }, 2500);
  };

  // ─── HEADER ─────────────────────────────────────────────────────────────
  const Header = () => (
    <AppBar position="sticky" sx={{ background: "rgba(15,26,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => navTo("home")}>
          <Spa sx={{ color: "#8b6914", fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800, color: "#e8e8e8", letterSpacing: "-0.5px" }}>
            Botanika<span style={{ color: "#8b6914" }}>PE</span>
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          {(["home", "catalogo"] as Page[]).map(p => (
            <Button key={p} onClick={() => navTo(p)} sx={{ color: page === p ? "#8b6914" : "#e8e8e8", fontWeight: page === p ? 700 : 400 }}>
              {p === "home" ? "Inicio" : "Catálogo"}
            </Button>
          ))}
          {(["hierbas", "hongos", "extractos", "esencias", "polvos"] as Category[]).map(c => (
            <Button key={c} size="small" onClick={() => { setFilterCategory(c); navTo("catalogo"); }} sx={{ color: "#a0a0a0", fontSize: "0.75rem" }}>
              {CATEGORY_LABELS[c].split(" ")[0]}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Carrito">
            <IconButton onClick={() => navTo("carrito")} sx={{ color: "#e8e8e8" }}>
              <Badge badgeContent={cartCount} color="warning"><ShoppingCart /></Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Cuenta">
            <IconButton sx={{ color: "#e8e8e8" }}><Person /></IconButton>
          </Tooltip>
          <IconButton sx={{ display: { md: "none" }, color: "#e8e8e8" }} onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );

  // ─── MOBILE DRAWER ───────────────────────────────────────────────────────
  const MobileDrawer = () => (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 260, background: "#1a2a1a" } }}>
      <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 700 }}>Menú</Typography>
        <IconButton onClick={() => setDrawerOpen(false)}><Close /></IconButton>
      </Box>
      <Divider />
      <List>
        {[{ label: "Inicio", page: "home" as Page }, { label: "Catálogo", page: "catalogo" as Page }, { label: "Carrito", page: "carrito" as Page }].map(item => (
          <ListItem key={item.page} disablePadding>
            <ListItemButton onClick={() => { navTo(item.page); setDrawerOpen(false); }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
          <ListItem key={c} disablePadding>
            <ListItemButton onClick={() => { setFilterCategory(c); navTo("catalogo"); setDrawerOpen(false); }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[c], mr: 1 }} />
              <ListItemText primary={CATEGORY_LABELS[c]} primaryTypographyProps={{ fontSize: "0.875rem" }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  // ─── PRODUCT CARD ────────────────────────────────────────────────────────
  const ProductCard = ({ producto }: { producto: Producto }) => (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ position: "relative" }}>
        <CardMedia component="img" height="200" image={producto.imagen} alt={producto.nombre} sx={{ objectFit: "cover" }} />
        {producto.precioAnterior && (
          <Chip label="OFERTA" size="small" sx={{ position: "absolute", top: 8, left: 8, background: "#f44336", color: "#fff", fontWeight: 700 }} />
        )}
        {producto.etiquetas.includes("nuevo") && (
          <Chip label="NUEVO" size="small" sx={{ position: "absolute", top: 8, right: 8, background: "#4caf50", color: "#fff", fontWeight: 700 }} />
        )}
        <Chip label={CATEGORY_LABELS[producto.categoria]} size="small"
          sx={{ position: "absolute", bottom: 8, left: 8, background: CATEGORY_COLORS[producto.categoria] + "cc", color: "#fff", fontSize: "0.7rem" }} />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: "#e8e8e8" }}>{producto.nombre}</Typography>
        <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1, fontSize: "0.78rem", lineHeight: 1.4 }}>
          {producto.descripcion.slice(0, 65)}…
        </Typography>
        <Rating value={producto.rating} precision={0.1} size="small" readOnly sx={{ mb: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>
            S/ {producto.precio.toFixed(2)}
          </Typography>
          {producto.precioAnterior && (
            <Typography variant="body2" sx={{ textDecoration: "line-through", color: "#606060" }}>
              S/ {producto.precioAnterior.toFixed(2)}
            </Typography>
          )}
        </Box>
        <Typography variant="caption" sx={{ color: producto.stock < 10 ? "#ff9800" : "#4caf50" }}>
          {producto.stock < 10 ? `Solo ${producto.stock} disponibles` : "En stock"}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => { setSelectedProduct(producto); navTo("producto"); }} sx={{ flex: 1, borderColor: "#444", color: "#a0a0a0" }}>
          Ver más
        </Button>
        <Button size="small" variant="contained" onClick={() => addToCart(producto)} sx={{ flex: 1 }}>
          Agregar
        </Button>
      </CardActions>
    </Card>
  );

  // ─── HOME PAGE ───────────────────────────────────────────────────────────
  const HomePage = () => {
    const [localSearch, setLocalSearch] = useState("");
    const destacados = PRODUCTOS.filter(p => p.etiquetas.includes("popular") || p.etiquetas.includes("premium")).slice(0, 8);

    return (
      <Box>
        {/* Hero */}
        <Box sx={{
          minHeight: "90vh", display: "flex", alignItems: "center",
          background: "linear-gradient(135deg, #0f1a0f 0%, #1b3a1b 40%, #1a1228 100%)",
          position: "relative", overflow: "hidden",
        }}>
          <Box sx={{
            position: "absolute", inset: 0, opacity: 0.15,
            backgroundImage: "url(https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=1400&fit=crop)",
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Chip label="🌿 Productos 100% naturales del Perú" sx={{ mb: 3, background: "rgba(139,105,20,0.2)", color: "#8b6914", border: "1px solid #8b6914" }} />
                <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", md: "4rem" }, fontWeight: 800, lineHeight: 1.1, mb: 2, color: "#e8e8e8" }}>
                  Descubre la<br />
                  <span style={{ background: "linear-gradient(135deg, #8b6914, #9c4fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Naturaleza
                  </span>
                </Typography>
                <Typography variant="h6" sx={{ color: "#a0a0a0", mb: 4, fontWeight: 400, maxWidth: 480 }}>
                  Hierbas, hongos funcionales, extractos y esencias botánicas seleccionadas directamente de la Amazonía y los Andes.
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                  <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={() => navTo("catalogo")} sx={{ px: 4 }}>
                    Ver catálogo
                  </Button>
                  <Button variant="outlined" size="large" sx={{ borderColor: "#8b6914", color: "#8b6914", px: 4 }}>
                    Nuestras categorías
                  </Button>
                </Box>
                <TextField
                  fullWidth placeholder="Buscar hierbas, hongos, extractos…"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { setSearchQuery(localSearch); navTo("catalogo"); } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search sx={{ color: "#8b6914" }} /></InputAdornment>,
                    endAdornment: localSearch && (
                      <InputAdornment position="end">
                        <Button size="small" variant="contained" onClick={() => { setSearchQuery(localSearch); navTo("catalogo"); }}>Buscar</Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ maxWidth: 520 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  {PRODUCTOS.slice(0, 4).map(p => (
                    <Box key={p.id} sx={{ borderRadius: 3, overflow: "hidden", aspectRatio: "1", position: "relative" }}>
                      <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                      <Typography variant="caption" sx={{ position: "absolute", bottom: 8, left: 8, color: "#fff", fontWeight: 600 }}>
                        {p.nombre.split(" ").slice(0, 2).join(" ")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Stats bar */}
        <Box sx={{ background: "#1a2a1a", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Container maxWidth="lg">
            <Grid container sx={{ py: 3 }}>
              {[
                { icon: <LocalShipping />, title: "Envío discreto", sub: "A todo el Perú" },
                { icon: <Security />, title: "Pagos seguros", sub: "Encriptación SSL" },
                { icon: <SupportAgent />, title: "Atención 24/7", sub: "WhatsApp directo" },
                { icon: <Star />, title: "Calidad premium", sub: "Certificado orgánico" },
              ].map((b, i) => (
                <Grid key={i} size={{ xs: 6, md: 3 }} sx={{ textAlign: "center", py: 2, borderRight: { md: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" } }}>
                  <Box sx={{ color: "#8b6914", mb: 0.5 }}>{b.icon}</Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.title}</Typography>
                  <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{b.sub}</Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Categorías */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ textAlign: "center", mb: 1, fontSize: { xs: "1.8rem", md: "2.4rem" } }}>
            Nuestras Categorías
          </Typography>
          <Typography variant="body1" sx={{ textAlign: "center", color: "#a0a0a0", mb: 5 }}>
            Cinco familias botánicas, un solo destino
          </Typography>
          <Grid container spacing={3}>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <Grid key={cat} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <Card sx={{ cursor: "pointer", overflow: "hidden" }} onClick={() => { setFilterCategory(cat); navTo("catalogo"); }}>
                  <Box sx={{ position: "relative", height: 200 }}>
                    <CardMedia component="img" image={CATEGORY_IMAGES[cat]} alt={CATEGORY_LABELS[cat]} sx={{ height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
                    <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", p: 2 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[cat], mb: 1 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: "center", color: "#fff", lineHeight: 1.2 }}>
                        {CATEGORY_LABELS[cat]}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        {PRODUCTOS.filter(p => p.categoria === cat).length} productos
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Destacados */}
        <Box sx={{ background: "#111a11", py: 8 }}>
          <Container maxWidth="lg">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <Box>
                <Typography variant="h3" sx={{ fontSize: { xs: "1.8rem", md: "2.2rem" } }}>Productos Destacados</Typography>
                <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Los más vendidos de nuestra tienda</Typography>
              </Box>
              <Button endIcon={<ArrowForward />} onClick={() => navTo("catalogo")} sx={{ color: "#8b6914" }}>Ver todos</Button>
            </Box>
            <Grid container spacing={3}>
              {destacados.map(p => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ProductCard producto={p} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
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
                {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
                  <Typography key={c} variant="body2" sx={{ color: "#a0a0a0", mb: 0.5, cursor: "pointer", "&:hover": { color: "#8b6914" } }}
                    onClick={() => { setFilterCategory(c); navTo("catalogo"); }}>
                    {CATEGORY_LABELS[c]}
                  </Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#8b6914" }}>Legal</Typography>
                {["Términos y condiciones", "Política de privacidad", "Envíos y devoluciones"].map(l => (
                  <Typography key={l} variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>{l}</Typography>
                ))}
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "#8b6914" }}>Contacto</Typography>
                <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>WhatsApp: +51 999 888 777</Typography>
                <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 0.5 }}>Email: hola@botanikape.com</Typography>
                <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Lima, Perú 🇵🇪</Typography>
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
  };

  // ─── CATALOG PAGE ────────────────────────────────────────────────────────
  const CatalogoPage = () => {
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
    const [sort, setSort] = useState("nombre");
    const [localCats, setLocalCats] = useState<Category[]>(filterCategory !== "all" ? [filterCategory] : []);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filtered = useMemo(() => {
      let list = [...PRODUCTOS];
      if (localCats.length > 0) list = list.filter(p => localCats.includes(p.categoria));
      if (localSearch) list = list.filter(p => p.nombre.toLowerCase().includes(localSearch.toLowerCase()) || p.descripcion.toLowerCase().includes(localSearch.toLowerCase()));
      list = list.filter(p => p.precio >= priceRange[0] && p.precio <= priceRange[1]);
      if (sort === "menor") list.sort((a, b) => a.precio - b.precio);
      else if (sort === "mayor") list.sort((a, b) => b.precio - a.precio);
      else if (sort === "nombre") list.sort((a, b) => a.nombre.localeCompare(b.nombre));
      else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
      return list;
    }, [localCats, localSearch, priceRange, sort]);

    const toggleCat = (c: Category) => {
      setLocalCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
    };

    const SidebarContent = () => (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Filtrar por</Typography>
        <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1 }}>Categoría</Typography>
        <FormGroup>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map(c => (
            <FormControlLabel key={c} control={<Checkbox size="small" checked={localCats.includes(c)} onChange={() => toggleCat(c)} sx={{ color: CATEGORY_COLORS[c], "&.Mui-checked": { color: CATEGORY_COLORS[c] } }} />}
              label={<Typography variant="body2">{CATEGORY_LABELS[c]}</Typography>} />
          ))}
        </FormGroup>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 2 }}>Precio: S/ {priceRange[0]} – S/ {priceRange[1]}</Typography>
        <Slider value={priceRange} onChange={(_, v) => setPriceRange(v as [number, number])} min={0} max={150} valueLabelDisplay="auto" valueLabelFormat={v => `S/${v}`} sx={{ color: "#8b6914" }} />
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
      </Box>
    );

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navTo("home")}>Inicio</Link>
          <Typography color="primary">Catálogo</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <TextField
            fullWidth placeholder="Buscar productos…"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
          <Button variant="outlined" startIcon={<FilterList />} onClick={() => setSidebarOpen(true)} sx={{ display: { md: "none" }, minWidth: 100, borderColor: "#444", color: "#a0a0a0" }}>
            Filtros
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Desktop sidebar */}
          <Grid size={{ xs: 0, md: 3 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Paper sx={{ background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2, position: "sticky", top: 80 }}>
              <SidebarContent />
            </Paper>
          </Grid>

          {/* Products */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#a0a0a0" }}>{filtered.length} productos encontrados</Typography>
            </Box>
            {filtered.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography variant="h6" sx={{ color: "#a0a0a0" }}>No se encontraron productos</Typography>
                <Button onClick={() => { setLocalCats([]); setLocalSearch(""); setPriceRange([0, 150]); }} sx={{ mt: 2, color: "#8b6914" }}>Limpiar filtros</Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filtered.map(p => (
                  <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ProductCard producto={p} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Mobile filter drawer */}
        <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} PaperProps={{ sx: { width: 280, background: "#1a2a1a" } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
            <Typography variant="h6">Filtros</Typography>
            <IconButton onClick={() => setSidebarOpen(false)}><Close /></IconButton>
          </Box>
          <SidebarContent />
          <Box sx={{ p: 2 }}>
            <Button fullWidth variant="contained" onClick={() => setSidebarOpen(false)}>Aplicar filtros</Button>
          </Box>
        </Drawer>
      </Container>
    );
  };

  // ─── PRODUCT DETAIL ──────────────────────────────────────────────────────
  const ProductoPage = () => {
    const p = selectedProduct;
    const [qty, setQty] = useState(1);
    const [tab, setTab] = useState(0);
    if (!p) return null;
    const relacionados = PRODUCTOS.filter(x => x.categoria === p.categoria && x.id !== p.id).slice(0, 4);

    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navTo("home")}>Inicio</Link>
          <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navTo("catalogo")}>Catálogo</Link>
          <Typography color="primary">{p.nombre}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img src={p.imagen} alt={p.nombre} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip label={CATEGORY_LABELS[p.categoria]} size="small" sx={{ mb: 2, background: CATEGORY_COLORS[p.categoria] + "33", color: CATEGORY_COLORS[p.categoria], border: `1px solid ${CATEGORY_COLORS[p.categoria]}66` }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{p.nombre}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Rating value={p.rating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" sx={{ color: "#a0a0a0" }}>({p.rating})</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
              <Typography variant="h3" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>
                S/ {p.precio.toFixed(2)}
              </Typography>
              {p.precioAnterior && (
                <Typography variant="h6" sx={{ textDecoration: "line-through", color: "#606060" }}>
                  S/ {p.precioAnterior.toFixed(2)}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <Chip icon={<Grass fontSize="small" />} label={`Origen: ${p.origen}`} size="small" variant="outlined" sx={{ borderColor: "#444", color: "#a0a0a0" }} />
              <Chip label={`Peso: ${p.peso}`} size="small" variant="outlined" sx={{ borderColor: "#444", color: "#a0a0a0" }} />
              <Chip label={p.stock < 10 ? `Stock: ${p.stock}` : "Disponible"} size="small" sx={{ background: p.stock < 10 ? "#ff980022" : "#4caf5022", color: p.stock < 10 ? "#ff9800" : "#4caf50" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Cantidad:</Typography>
              <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #444", borderRadius: 2 }}>
                <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))}><Remove fontSize="small" /></IconButton>
                <Typography sx={{ px: 2, fontFamily: "Roboto Mono", minWidth: 32, textAlign: "center" }}>{qty}</Typography>
                <IconButton size="small" onClick={() => setQty(q => Math.min(p.stock, q + 1))}><Add fontSize="small" /></IconButton>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="contained" size="large" fullWidth onClick={() => { for (let i = 0; i < qty; i++) addToCart(p); }}>
                Agregar al carrito
              </Button>
              <Button variant="outlined" size="large" fullWidth onClick={() => { for (let i = 0; i < qty; i++) addToCart(p); navTo("carrito"); }}
                sx={{ borderColor: "#8b6914", color: "#8b6914" }}>
                Comprar ahora
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)", mb: 3, "& .MuiTab-root": { color: "#a0a0a0" }, "& .Mui-selected": { color: "#8b6914" }, "& .MuiTabs-indicator": { background: "#8b6914" } }}>
            <Tab label="Descripción" />
            <Tab label="Información adicional" />
            <Tab label="Envíos" />
          </Tabs>
          {tab === 0 && <Typography variant="body1" sx={{ color: "#c0c0c0", lineHeight: 2 }}>{p.descripcion} Producto 100% natural, sin conservantes ni aditivos. Recomendado por naturistas y especialistas en fitoterapia.</Typography>}
          {tab === 1 && (
            <Grid container spacing={2}>
              {[["Origen", p.origen], ["Peso neto", p.peso], ["Categoría", CATEGORY_LABELS[p.categoria]], ["Stock", `${p.stock} unidades`]].map(([k, v]) => (
                <Grid key={k} size={{ xs: 6, md: 3 }}>
                  <Paper sx={{ p: 2, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{k}</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{v}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
          {tab === 2 && (
            <Box>
              {[["Envío Standard", "3-5 días hábiles", "S/ 15"], ["Envío Express", "24-48 horas", "S/ 25"], ["Discreto Premium", "5-7 días, embalaje especial", "S/ 35"]].map(([t, d, c]) => (
                <Box key={t} sx={{ display: "flex", justifyContent: "space-between", p: 2, mb: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <Box>
                    <Typography variant="subtitle2">{t}</Typography>
                    <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{d}</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontFamily: "Roboto Mono", color: "#8b6914" }}>{c}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {relacionados.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>Productos relacionados</Typography>
            <Grid container spacing={2}>
              {relacionados.map(r => (
                <Grid key={r.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCard producto={r} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    );
  };

  // ─── CART PAGE ───────────────────────────────────────────────────────────
  const CarritoPage = () => (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Tu carrito</Typography>
      {cart.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <ShoppingCart sx={{ fontSize: 80, color: "#333", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#a0a0a0", mb: 2 }}>Tu carrito está vacío</Typography>
          <Button variant="contained" onClick={() => navTo("catalogo")}>Ver catálogo</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            {cart.map(({ producto: p, cantidad }) => (
              <Paper key={p.id} sx={{ display: "flex", gap: 2, p: 2, mb: 2, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Box sx={{ width: 90, height: 90, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                  <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.nombre}</Typography>
                  <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{CATEGORY_LABELS[p.categoria]} · {p.peso}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: 1 }}>
                      <IconButton size="small" onClick={() => updateCantidad(p.id, -1)}><Remove fontSize="small" /></IconButton>
                      <Typography sx={{ px: 1.5, fontFamily: "Roboto Mono" }}>{cantidad}</Typography>
                      <IconButton size="small" onClick={() => updateCantidad(p.id, 1)}><Add fontSize="small" /></IconButton>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>
                      S/ {(p.precio * cantidad).toFixed(2)}
                    </Typography>
                    <IconButton size="small" onClick={() => removeFromCart(p.id)} sx={{ color: "#f44336" }}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 90 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>Resumen del pedido</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Subtotal ({cartCount} items)</Typography>
                <Typography variant="body2" sx={{ fontFamily: "Roboto Mono" }}>S/ {subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Envío (estimado)</Typography>
                <Typography variant="body2" sx={{ fontFamily: "Roboto Mono" }}>S/ {envioMontoCosto.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total</Typography>
                <Typography variant="h6" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>S/ {total.toFixed(2)}</Typography>
              </Box>
              <Button fullWidth variant="contained" size="large" onClick={() => navTo("checkout")}>
                Continuar compra
              </Button>
              <Button fullWidth onClick={() => navTo("catalogo")} sx={{ mt: 1, color: "#a0a0a0" }}>
                Seguir comprando
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );

  // ─── CHECKOUT PAGE ───────────────────────────────────────────────────────
  const CheckoutPage = () => {
    const steps = ["Datos de envío", "Método de envío", "Pago"];

    const StepEnvio = () => (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Información de contacto</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Nombre completo *" value={envioForm.nombre}
            onChange={e => setEnvioForm(f => ({ ...f, nombre: e.target.value }))}
            error={!!envioErrors.nombre} helperText={envioErrors.nombre} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Correo electrónico *" type="email" value={envioForm.email}
            onChange={e => setEnvioForm(f => ({ ...f, email: e.target.value }))}
            error={!!envioErrors.email} helperText={envioErrors.email} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Teléfono peruano *" placeholder="9XXXXXXXX" value={envioForm.telefono}
            onChange={e => setEnvioForm(f => ({ ...f, telefono: e.target.value }))}
            error={!!envioErrors.telefono} helperText={envioErrors.telefono || "9 dígitos, empieza con 9"} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>Dirección de entrega</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth label="Dirección completa *" placeholder="Ej: Av. Larco 1234, Dpto 502, Miraflores"
            value={envioForm.direccion}
            onChange={e => setEnvioForm(f => ({ ...f, direccion: e.target.value }))}
            error={!!envioErrors.direccion} helperText={envioErrors.direccion || "Incluye calle, número, piso o dpto si aplica"}
            multiline rows={2} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Ciudad *" placeholder="Ej: Lima, Arequipa, Cusco…"
            value={envioForm.ciudad}
            onChange={e => setEnvioForm(f => ({ ...f, ciudad: e.target.value }))}
            error={!!envioErrors.ciudad} helperText={envioErrors.ciudad} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField fullWidth label="Referencia del lugar (opcional)"
            placeholder="Ej: Frente al parque, edificio azul, cerca al Wong"
            value={envioForm.referencia}
            onChange={e => setEnvioForm(f => ({ ...f, referencia: e.target.value }))}
            helperText="Ayuda al repartidor a encontrar tu dirección" />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button variant="contained" size="large" onClick={() => { if (validateEnvio()) setCheckoutStep(1); }} sx={{ mt: 1 }}>
            Continuar al método de envío
          </Button>
        </Grid>
      </Grid>
    );

    const StepEnvioMetodo = () => (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>Selecciona tu método de envío</Typography>
        {[
          { value: "standard", label: "Envío Standard", sub: "3-5 días hábiles", precio: "S/ 15.00" },
          { value: "express", label: "Envío Express", sub: "24-48 horas", precio: "S/ 25.00" },
          { value: "discreto", label: "Discreto Premium", sub: "5-7 días, embalaje especial sin logo", precio: "S/ 35.00" },
        ].map(opt => (
          <Paper key={opt.value} onClick={() => setMetodoEnvio(opt.value)}
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, mb: 2, cursor: "pointer",
              background: metodoEnvio === opt.value ? "rgba(139,105,20,0.12)" : "#1a2a1a",
              border: `2px solid ${metodoEnvio === opt.value ? "#8b6914" : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.2s" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${metodoEnvio === opt.value ? "#8b6914" : "#444"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {metodoEnvio === opt.value && <Box sx={{ width: 10, height: 10, borderRadius: "50%", background: "#8b6914" }} />}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{opt.label}</Typography>
                <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{opt.sub}</Typography>
              </Box>
            </Box>
            <Typography variant="subtitle1" sx={{ fontFamily: "Roboto Mono", color: "#8b6914" }}>{opt.precio}</Typography>
          </Paper>
        ))}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={() => setCheckoutStep(0)} sx={{ borderColor: "#444", color: "#a0a0a0" }}>Atrás</Button>
          <Button variant="contained" onClick={() => setCheckoutStep(2)}>Continuar al pago</Button>
        </Box>
      </Box>
    );

    const StepPago = () => (
      <Box>
        <Typography variant="h6" sx={{ mb: 3 }}>Método de pago</Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {[{ value: "tarjeta", label: "Tarjeta crédito/débito" }, { value: "yape", label: "Yape" }, { value: "plin", label: "Plin" }, { value: "transferencia", label: "Transferencia bancaria" }].map(opt => (
            <Grid key={opt.value} size={{ xs: 6, md: 3 }}>
              <Paper onClick={() => setMetodoPago(opt.value)} sx={{ p: 2, textAlign: "center", cursor: "pointer",
                background: metodoPago === opt.value ? "rgba(139,105,20,0.12)" : "#1a2a1a",
                border: `2px solid ${metodoPago === opt.value ? "#8b6914" : "rgba(255,255,255,0.08)"}`,
                transition: "all 0.2s" }}>
                <Typography variant="body2" sx={{ fontWeight: metodoPago === opt.value ? 700 : 400, color: metodoPago === opt.value ? "#8b6914" : "#e8e8e8" }}>
                  {opt.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {metodoPago === "tarjeta" && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Número de tarjeta" placeholder="XXXX XXXX XXXX XXXX"
                value={pagoForm.numero} onChange={e => setPagoForm(f => ({ ...f, numero: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Vencimiento" placeholder="MM/AA"
                value={pagoForm.vencimiento} onChange={e => setPagoForm(f => ({ ...f, vencimiento: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="CVV" placeholder="XXX" type="password"
                value={pagoForm.cvv} onChange={e => setPagoForm(f => ({ ...f, cvv: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Nombre del titular"
                value={pagoForm.titular} onChange={e => setPagoForm(f => ({ ...f, titular: e.target.value }))} />
            </Grid>
          </Grid>
        )}

        {(metodoPago === "yape" || metodoPago === "plin") && (
          <Paper sx={{ p: 3, mb: 3, background: "#1e1e1e", border: "1px solid #333", textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Escanea el QR con tu app {metodoPago === "yape" ? "Yape" : "Plin"}</Typography>
            <Box sx={{ width: 120, height: 120, background: "#333", borderRadius: 2, mx: "auto", mt: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="caption" sx={{ color: "#666" }}>QR demo</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#606060", display: "block", mt: 1 }}>Número: 999 888 777</Typography>
          </Paper>
        )}

        {metodoPago === "transferencia" && (
          <Paper sx={{ p: 3, mb: 3, background: "#1e1e1e", border: "1px solid #333" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Datos bancarios</Typography>
            {[["Banco", "BCP"], ["Cuenta", "191-XXXXXXXX-0-12"], ["Titular", "BotanikaPE SAC"], ["CCI", "00219100XXXXXXXXXX12"]].map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{k}</Typography>
                <Typography variant="caption" sx={{ fontFamily: "Roboto Mono" }}>{v}</Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Order summary */}
        <Paper sx={{ p: 2, background: "#111", border: "1px solid #333", mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: "#a0a0a0" }}>Resumen final</Typography>
          {cart.map(({ producto, cantidad }) => (
            <Box key={producto.id} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2">{producto.nombre} x{cantidad}</Typography>
              <Typography variant="body2" sx={{ fontFamily: "Roboto Mono" }}>S/ {(producto.precio * cantidad).toFixed(2)}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle2">Total a pagar</Typography>
            <Typography variant="subtitle1" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>S/ {total.toFixed(2)}</Typography>
          </Box>
        </Paper>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={() => setCheckoutStep(1)} sx={{ borderColor: "#444", color: "#a0a0a0" }}>Atrás</Button>
          <Button variant="contained" size="large" fullWidth onClick={handlePagar} disabled={procesando}
            sx={{ background: procesando ? "#444" : undefined }}>
            {procesando ? "Procesando pago…" : `Pagar S/ ${total.toFixed(2)}`}
          </Button>
        </Box>
      </Box>
    );

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>Checkout</Typography>
        <Stepper activeStep={checkoutStep} sx={{ mb: 4, "& .MuiStepLabel-root .Mui-completed": { color: "#8b6914" }, "& .MuiStepLabel-root .Mui-active": { color: "#8b6914" } }}>
          {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>
        <Paper sx={{ p: { xs: 2, md: 4 }, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
          {checkoutStep === 0 && <StepEnvio />}
          {checkoutStep === 1 && <StepEnvioMetodo />}
          {checkoutStep === 2 && <StepPago />}
        </Paper>
      </Container>
    );
  };

  // ─── CONFIRMATION ────────────────────────────────────────────────────────
  const ConfirmacionPage = () => (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <CheckCircle sx={{ fontSize: 100, color: "#4caf50", mb: 3 }} />
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>¡Pedido confirmado!</Typography>
      <Typography variant="body1" sx={{ color: "#a0a0a0", mb: 1 }}>
        Número de pedido:
      </Typography>
      <Typography variant="h5" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", mb: 3, fontWeight: 700 }}>
        {confirmacion?.numero || orderNumber}
      </Typography>
      <Paper sx={{ p: 3, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", mb: 4 }}>
        <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1 }}>Total pagado</Typography>
        <Typography variant="h4" sx={{ fontFamily: "Roboto Mono", color: "#4caf50", fontWeight: 700 }}>
          S/ {(confirmacion?.total ?? total).toFixed(2)}
        </Typography>
        <Typography variant="caption" sx={{ color: "#606060", display: "block", mt: 1 }}>
          Recibirás un email de confirmación en breve. 🌿
        </Typography>
      </Paper>
      <Button variant="contained" size="large" onClick={() => { setCheckoutStep(0); setEnvioForm({ nombre: "", email: "", telefono: "", direccion: "", ciudad: "", referencia: "" }); navTo("home"); }}>
        Seguir comprando
      </Button>
    </Container>
  );

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Header />
      <MobileDrawer />

      <Box component="main" sx={{ minHeight: "80vh" }}>
        {page === "home" && <HomePage />}
        {page === "catalogo" && <CatalogoPage />}
        {page === "producto" && <ProductoPage />}
        {page === "carrito" && <CarritoPage />}
        {page === "checkout" && <CheckoutPage />}
        {page === "confirmacion" && <ConfirmacionPage />}
      </Box>

      {showScrollTop && (
        <Fab size="small" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{ position: "fixed", bottom: 24, right: 24, background: "#8b6914", color: "#fff", "&:hover": { background: "#a07820" } }}>
          <KeyboardArrowUp />
        </Fab>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
