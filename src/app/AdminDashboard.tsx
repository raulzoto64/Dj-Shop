import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "./LoginPage.tsx";
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  Button, TextField, InputAdornment, IconButton, Box, Container, Grid,
  Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Tabs, Tab, Snackbar, Alert, Select, MenuItem, FormControl,
  InputLabel, Switch, Pagination
} from "@mui/material";
import {
  Search, Close, Add, Edit, Delete,
  Save, Category, Inventory, Refresh,
} from "@mui/icons-material";

const adminTheme = createTheme({
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
          "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
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

type TabType = "categorias" | "productos" | "usuarios";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  rol: string;
  activo: boolean;
  fecha_registro: string;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
}

interface Producto {
  id: number;
  nombre: string;
  categoria_id: string;
  precio: number;
  precio_anterior: number | null;
  imagen: string | null;
  descripcion: string | null;
  stock: number;
  peso: string | null;
  peso_unidad?: string;
  origen: string | null;
  rating: number | null;
  etiquetas: string[];
  precios?: { cantidad: number; unidad: string; precio: number }[];
}

const CATEGORIAS_HARDCODED = [
  { id: "hierbas", nombre: "Hierbas Tradicionales" },
  { id: "hongos", nombre: "Hongos Funcionales" },
  { id: "extractos", nombre: "Extractos Naturales" },
  { id: "esencias", nombre: "Esencias Botánicas" },
  { id: "polvos", nombre: "Polvos y Resinas" },
];

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [tab, setTab] = useState<TabType>("categorias");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({ open: false, msg: "", severity: "success" });

  // Dialogos
  const [catDialog, setCatDialog] = useState<{ open: boolean; edit: Categoria | null }>({ open: false, edit: null });
  const [prodDialog, setProdDialog] = useState<{ open: boolean; edit: Producto | null }>({ open: false, edit: null });

  // Form states
  const [catForm, setCatForm] = useState({ nombre: "", descripcion: "" });
  const [prodForm, setProdForm] = useState({
    nombre: "", categoria_id: "", precio: "", precio_anterior: "", imagen: "",
    descripcion: "", stock: "", peso: "", peso_unidad: "g", origen: ""
  });
  const [prodPrecios, setProdPrecios] = useState<{ cantidad: string; unidad: string; precio: string }[]>([]);
  const [catImagenFile, setCatImagenFile] = useState<File | null>(null);
  const [prodImagenFile, setProdImagenFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [searchCat, setSearchCat] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchProd, setSearchProd] = useState("");
  const [catFilterProd, setCatFilterProd] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [deleteState, setDeleteState] = useState<{ open: boolean; type: 'categoria' | 'producto' | 'usuario' | null; item: Categoria | Producto | Cliente | null }>({ open: false, type: null, item: null });

  useEffect(() => {
    cargarDatos();
  }, []);

   const cargarDatos = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes, clientesRes] = await Promise.all([
        supabase.from("categorias").select("*"),
        supabase.from("productos").select("*"),
        supabase.from("clientes").select("id, nombre, email, telefono, direccion, rol, activo, fecha_registro").order("fecha_registro", { ascending: false }),
      ]);

      if (catsRes.error) throw catsRes.error;
      const categoriasExistentes = (catsRes.data as Categoria[]) || [];
      
      // Sincronizar categorías hardcodeadas solo si la tabla está vacía
      if (categoriasExistentes.length === 0) {
        for (const hc of CATEGORIAS_HARDCODED) {
          await supabase.from("categorias").insert({ id: hc.id, nombre: hc.nombre });
        }
      }
      const { data: catsRefreshed } = await supabase.from("categorias").select("*");
      setCategorias((catsRefreshed as Categoria[]) || []);

      if (prodsRes.error) throw prodsRes.error;
      setProductos((prodsRes.data as Producto[]) || []);

      if (clientesRes.error) throw clientesRes.error;
      setClientes((clientesRes.data as Cliente[]) || []);

      setSnack({ open: true, msg: "Datos actualizados", severity: "success" });
    } catch (e) {
      setSnack({ open: true, msg: "Error al cargar datos", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ── CATEGORÍAS CRUD ──────────────────────────────────────────
  const abrirCatDialog = (edit?: Categoria) => {
    if (edit) {
      setCatForm({ nombre: edit.nombre, descripcion: edit.descripcion || "" });
    } else {
      setCatForm({ nombre: "", descripcion: "" });
    }
    setCatDialog({ open: true, edit: edit || null });
    setCatImagenFile(null);
  };

  const subirImagenImageKit = async (file: File): Promise<string | null> => {
    try {
      console.log("Subiendo imagen a ImageKit:", file.name);
      // Para demo: convertir a base64 data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch (e) {
      console.error("Error subiendo imagen:", e);
      return null;
    }
  };

  const guardarCategoria = async () => {
    if (!catForm.nombre.trim()) return setSnack({ open: true, msg: "Nombre requerido", severity: "error" });
    try {
      let imagenUrl: string | null = null;
      if (catImagenFile) {
        setUploading(true);
        imagenUrl = await subirImagenImageKit(catImagenFile);
        setUploading(false);
        if (!imagenUrl) return setSnack({ open: true, msg: "Error al subir imagen", severity: "error" });
      }

      if (catDialog.edit) {
        const payload: Record<string, unknown> = {
          nombre: catForm.nombre.trim(),
          descripcion: catForm.descripcion.trim() || null,
        };
        if (imagenUrl) payload.imagen = imagenUrl;
        const { error } = await supabase.from("categorias").update(payload).eq("id", catDialog.edit.id);
        if (error) throw error;
      } else {
        const payload: Record<string, unknown> = {
          id: crypto.randomUUID(),
          nombre: catForm.nombre.trim(),
          descripcion: catForm.descripcion.trim() || null,
        };
        if (imagenUrl) payload.imagen = imagenUrl;
        const { error } = await supabase.from("categorias").insert(payload);
        if (error) throw error;
      }
      setCatDialog({ open: false, edit: null });
      setCatImagenFile(null);
      cargarDatos();
      setSnack({ open: true, msg: "Categoría guardada", severity: "success" });
    } catch (e) {
      console.error("Error guardando categoría:", e);
      setSnack({ open: true, msg: "Error al guardar categoría", severity: "error" });
      setUploading(false);
    }
  };

const eliminarCategoria = (cat: Categoria) => {
    console.log("[DELETE] Verificando categoría:", { id: cat.id, nombre: cat.nombre, totalProductos: productos.length });
    const productosEnCategoria = productos.filter(p => p.categoria_id === cat.id);
    console.log("[DELETE] Productos en esta categoría:", productosEnCategoria.length, productosEnCategoria.map(p => ({ id: p.id, nombre: p.nombre, categoria_id: p.categoria_id })));
    if (productosEnCategoria.length > 0) {
      setSnack({ open: true, msg: `No se puede eliminar "${cat.nombre}" porque tiene ${productosEnCategoria.length} producto(s) asociado(s)`, severity: "error" });
      return;
    }
    setDeleteState({ open: true, type: 'categoria', item: cat });
  };

  const eliminarProducto = (p: Producto) => {
    setDeleteState({ open: true, type: 'producto', item: p });
  };

  const eliminarUsuario = (u: Cliente) => {
    setDeleteState({ open: true, type: 'usuario', item: u });
  };

  const handleDeleteConfirm = async () => {
    const { type, item } = deleteState;
    if (!type || !item) return;
    try {
      if (type === 'categoria') {
        const cat = item as Categoria;
        console.log("[DELETE] Intentando eliminar categoría:", { id: cat.id, nombre: cat.nombre });
        const { data, error } = await supabase.from('categorias').delete().eq('id', cat.id).select();
        console.log("[DELETE] Resultado categoría:", { data, error });
        if (error) throw error;
        if (!data || data.length === 0) {
          console.warn("[DELETE] No se eliminó ninguna fila (posible RLS o FK)");
          setSnack({ open: true, msg: 'No se pudo eliminar la categoría (RLS o restricción)', severity: 'error' });
          return;
        }
        cargarDatos();
        setSnack({ open: true, msg: 'Categoría eliminada', severity: 'success' });
      } else if (type === 'producto') {
        const p = item as Producto;
        console.log("[DELETE] Intentando eliminar producto:", { id: p.id, nombre: p.nombre });
        const { data, error } = await supabase.from('productos').delete().eq('id', p.id).select();
        console.log("[DELETE] Resultado producto:", { data, error });
        if (error) throw error;
        if (!data || data.length === 0) {
          console.warn("[DELETE] No se eliminó ninguna fila");
          setSnack({ open: true, msg: 'No se pudo eliminar el producto', severity: 'error' });
          return;
        }
        cargarDatos();
        setSnack({ open: true, msg: 'Producto eliminado', severity: 'success' });
      } else if (type === 'usuario') {
        const u = item as Cliente;
        console.log("[DELETE] Intentando eliminar usuario:", { id: u.id, nombre: u.nombre });
        const { data, error } = await supabase.from('clientes').delete().eq('id', u.id).select();
        console.log("[DELETE] Resultado usuario:", { data, error });
        if (error) throw error;
        if (!data || data.length === 0) {
          console.warn("[DELETE] No se eliminó ninguna fila");
          setSnack({ open: true, msg: 'No se pudo eliminar el usuario', severity: 'error' });
          return;
        }
        cargarDatos();
        setSnack({ open: true, msg: 'Usuario eliminado', severity: 'success' });
      }
    } catch {
      setSnack({ open: true, msg: `Error al eliminar ${type}`, severity: 'error' });
    } finally {
      setDeleteState({ open: false, type: null, item: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteState({ open: false, type: null, item: null });
  };

  // ── PRODUCTOS CRUD ──────────────────────────────────────────
  const abrirProdDialog = (edit?: Producto) => {
    if (edit) {
      setProdForm({
        nombre: edit.nombre, categoria_id: edit.categoria_id, precio: String(edit.precio ?? 0),
        precio_anterior: edit.precio_anterior ? String(edit.precio_anterior) : "",
        imagen: edit.imagen || "", descripcion: edit.descripcion || "",
        stock: String(edit.stock),
        peso: (edit.peso || "").replace(/\s+(g|kg|unidades)$/, ""),
        peso_unidad: ((edit.peso || "").match(/\s+(g|kg|unidades)$/) || [, "g"])[1],
        origen: edit.origen || "",
      });
      setProdPrecios((edit.precios || []).map(p => ({
        cantidad: String((p as any).cantidad ?? (p as any).gramos ?? ""),
        unidad: (p as any).unidad || "g",
        precio: String(p.precio),
      })));
      console.log("Abriendo edición de producto:", edit);
    } else {
      setProdForm({
        nombre: "", categoria_id: categorias[0]?.id || "", precio: "",
        precio_anterior: "", imagen: "", descripcion: "", stock: "",
        peso: "", peso_unidad: "g", origen: ""
      });
      setProdPrecios([]);
    }
    setProdDialog({ open: true, edit: edit || null });
    setProdImagenFile(null);
  };

  const guardarProducto = async () => {
    console.log("Guardando producto...", prodDialog.edit ? "EDITANDO" : "NUEVO");
    if (!prodForm.nombre.trim()) return setSnack({ open: true, msg: "Nombre requerido", severity: "error" });
    if (!prodForm.categoria_id) return setSnack({ open: true, msg: "Categoría requerida", severity: "error" });
    try {
      console.log("[AUTH] usuario desde useAuth():", authUser);
      let usuario_id: string | null = null;
      if (authUser?.email) {
        const { data: cliente } = await supabase.from("clientes").select("id").eq("email", authUser.email).single();
        console.log("[AUTH] cliente encontrado en DB:", cliente);
        usuario_id = cliente?.id || null;
      }
      console.log("[AUTH] usuario_id a usar:", usuario_id);

      let imagenUrl = prodForm.imagen.trim();
      if (prodImagenFile) {
        setUploading(true);
        const uploadedUrl = await subirImagenImageKit(prodImagenFile);
        setUploading(false);
        if (!uploadedUrl) return setSnack({ open: true, msg: "Error al subir imagen", severity: "error" });
        imagenUrl = uploadedUrl;
      }

      const payload: Record<string, unknown> = {
        nombre: prodForm.nombre.trim(),
        categoria_id: prodForm.categoria_id,
        precio: parseFloat(prodForm.precio) || 0,
        precio_anterior: prodForm.precio_anterior ? parseFloat(prodForm.precio_anterior) : null,
        imagen: imagenUrl || "https://via.placeholder.com/400?text=Sin+imagen",
        descripcion: prodForm.descripcion.trim() || null,
        stock: parseInt(prodForm.stock) || 0,
        peso: prodForm.peso.trim() ? `${prodForm.peso.trim()} ${prodForm.peso_unidad || "g"}` : null,
        origen: prodForm.origen.trim() || null,
        usuario_id,
        precios: prodPrecios.filter(p => p.cantidad && p.precio).map(p => ({ cantidad: parseFloat(p.cantidad), unidad: p.unidad || "g", precio: parseFloat(p.precio) })),
      };
      if ((payload.precios as any[]).length === 0) delete payload.precios;

      console.log("Payload a enviar:", payload);
      console.log("Modo:", prodDialog.edit ? "UPDATE" : "INSERT");

      if (prodDialog.edit) {
        console.log("Actualizando producto ID:", prodDialog.edit.id);
        const { data, error } = await supabase.from("productos").update(payload).eq("id", prodDialog.edit.id).select();
        console.log("Resultado UPDATE:", data, error);
        if (error) throw error;
      } else {
        console.log("Insertando nuevo producto");
        const { data, error } = await supabase.from("productos").insert(payload).select();
        console.log("Resultado INSERT:", data, error);
        if (error) throw error;
      }
      setProdDialog({ open: false, edit: null });
      setProdImagenFile(null);
      cargarDatos();
      setSnack({ open: true, msg: "Producto guardado", severity: "success" });
    } catch (e) {
      console.error("Error guardando producto:", e);
      setSnack({ open: true, msg: "Error al guardar producto", severity: "error" });
      setUploading(false);
    }
  };

   // ── GESTIÓN DE ROLES ───────────────────────────────────────
   const cambiarRol = async (clienteId: string, nuevoRol: string) => {
     try {
       const { error } = await supabase.from("clientes").update({ rol: nuevoRol }).eq("id", clienteId);
       if (error) throw error;
       setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, rol: nuevoRol } : c));
       setSnack({ open: true, msg: "Rol actualizado", severity: "success" });
     } catch {
       setSnack({ open: true, msg: "Error al actualizar rol", severity: "error" });
     }
   };

   const cambiarActivo = async (clienteId: string, activo: boolean) => {
     try {
       const { error } = await supabase.from("clientes").update({ activo }).eq("id", clienteId);
       if (error) throw error;
       setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, activo } : c));
       setSnack({ open: true, msg: activo ? "Usuario activado" : "Usuario desactivado", severity: "success" });
     } catch {
       setSnack({ open: true, msg: "Error al cambiar estado", severity: "error" });
     }
   };

   // ── FILTRADO Y PAGINACIÓN ───────────────────────────────────
  const categoriasFiltradas = categorias.filter(c =>
    c.id.toLowerCase().includes(searchCat.toLowerCase()) ||
    c.nombre.toLowerCase().includes(searchCat.toLowerCase())
  );

  const produtosFiltrados = productos.filter(p => {
    const matchNombre = p.nombre.toLowerCase().includes(searchProd.toLowerCase());
    const matchCategoria = catFilterProd === "" || p.categoria_id === catFilterProd;
    return matchNombre && matchCategoria;
  });

  const paginatedProductos = produtosFiltrados.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {/* Header Admin */}
      <AppBar position="sticky" sx={{ background: "rgba(15,26,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Inventory sx={{ color: "#8b6914", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800, color: "#e8e8e8" }}>
              Panel de Administración
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Estadísticas rápidas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ background: "linear-gradient(135deg, #1a2a1a 0%, #1e2e1e 100%)" }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1 }}>Total Categorías</Typography>
                <Typography variant="h4" sx={{ color: "#8b6914", fontWeight: 700 }}>{categorias.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1 }}>Total Productos</Typography>
                <Typography variant="h4" sx={{ color: "#6b2d5c", fontWeight: 700 }}>{productos.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1 }}>Productos Activos</Typography>
                <Typography variant="h4" sx={{ color: "#4caf50", fontWeight: 700 }}>{productos.filter(p => p.stock > 0).length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 1 }}>Bajo Stock</Typography>
                <Typography variant="h4" sx={{ color: "#ff9800", fontWeight: 700 }}>{productos.filter(p => p.stock < 10).length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

         {/* Tabs */}
         <Paper sx={{ mb: 3, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
           <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
             <Tab label="Categorías" value="categorias" icon={<Category />} sx={{ color: "#e8e8e8" }} />
             <Tab label="Productos" value="productos" icon={<Inventory />} sx={{ color: "#e8e8e8" }} />
             <Tab label={`Usuarios (${clientes.length})`} value="usuarios" icon={<Inventory />} sx={{ color: "#e8e8e8" }} />
           </Tabs>
         </Paper>

         {/* ── PESTAÑA USUARIOS ─────────────────────── */}
         {tab === "usuarios" && (
           <Box>
             <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                  placeholder="Buscar usuarios..."
                  value={searchUser}
                  onChange={e => setSearchUser(e.target.value)}
                  size="small"
                  sx={{ minWidth: 300, flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                  }}
                />
             </Box>
             {loading ? (
               <Typography sx={{ color: "#a0a0a0", textAlign: "center", py: 8 }}>Cargando...</Typography>
             ) : (
               <TableContainer component={Paper} sx={{ background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                 <Table>
                   <TableHead>
                     <TableRow sx={{ "& th": { color: "#a0a0a0", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" } }}>
                       <TableCell>Nombre</TableCell>
                       <TableCell>Email</TableCell>
                       <TableCell align="center">Rol</TableCell>
                       <TableCell align="center">Activo</TableCell>
                       <TableCell>Fecha Registro</TableCell>
                       <TableCell align="right">Acciones</TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {clientes.map(c => (
                       <TableRow key={c.id} sx={{ "&:hover": { background: "rgba(255,255,255,0.03)" } }}>
                         <TableCell>
                           <Typography sx={{ fontWeight: 600, color: "#e8e8e8" }}>{c.nombre}</Typography>
                         </TableCell>
                         <TableCell>
                           <Typography variant="body2" sx={{ color: "#a0a0a0" }}>{c.email}</Typography>
                         </TableCell>
                         <TableCell align="center">
                           <FormControl size="small" sx={{ minWidth: 120 }}>
                             <Select
                               value={c.rol}
                               onChange={e => cambiarRol(c.id, e.target.value)}
                               sx={{ 
                                 background: c.rol === "admin" ? "rgba(139,105,20,0.2)" : c.rol === "vendedor" ? "rgba(107,45,92,0.2)" : "rgba(255,255,255,0.05)",
                                 color: c.rol === "admin" ? "#8b6914" : c.rol === "vendedor" ? "#6b2d5c" : "#a0a0a0",
                               }}
                             >
                               <MenuItem value="admin">Admin</MenuItem>
                               <MenuItem value="vendedor">Vendedor</MenuItem>
                               <MenuItem value="usuario">Usuario</MenuItem>
                             </Select>
                           </FormControl>
                         </TableCell>
                         <TableCell align="center">
                           <Switch
                             checked={c.activo}
                             onChange={e => cambiarActivo(c.id, e.target.checked)}
                             color="primary"
                           />
                         </TableCell>
                         <TableCell>
                           <Typography variant="caption" sx={{ color: "#a0a0a0" }}>
                             {new Date(c.fecha_registro).toLocaleDateString()}
                           </Typography>
                         </TableCell>
                         <TableCell align="right">
                        <IconButton size="small" sx={{ color: "#8b6914" }}><Edit fontSize="small" /></IconButton>
                            <IconButton size="small" onClick={() => eliminarUsuario(c)} sx={{ color: "#f44336" }}><Delete fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

         {/* ── PESTAÑA CATEGORÍAS ─────────────────────── */}
        {tab === "categorias" && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                placeholder="Buscar categorías..."
                value={searchCat}
                onChange={e => setSearchCat(e.target.value)}
                size="small"
                sx={{ minWidth: 300, flexGrow: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }}
              />
              <Button variant="contained" startIcon={<Add />} onClick={() => abrirCatDialog()} sx={{ height: 40 }}>
                Nueva Categoría
              </Button>
            </Box>
            {loading ? (
              <Typography sx={{ color: "#a0a0a0", textAlign: "center", py: 8 }}>Cargando...</Typography>
            ) : categoriasFiltradas.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Category sx={{ fontSize: 60, color: "#333", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#a0a0a0" }}>No se encontraron categorías</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => abrirCatDialog()} sx={{ mt: 2 }}>
                  Crear primera categoría
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {categoriasFiltradas.map(cat => (
                  <Grid key={cat.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                          <Chip label={cat.id} size="small" sx={{ background: "#8b6914", color: "#fff" }} />
                          <Chip
                            label={productos.filter(p => p.categoria_id === cat.id).length}
                            size="small"
                            color="secondary"
                          />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{cat.nombre}</Typography>
                        <Typography variant="body2" sx={{ color: "#a0a0a0", fontSize: "0.8rem" }}>
                          {cat.descripcion || "Sin descripción"}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0, justifyContent: "flex-end" }}>
                        <IconButton size="small" onClick={() => abrirCatDialog(cat)} sx={{ color: "#8b6914" }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => eliminarCategoria(cat)} sx={{ color: "#f44336" }}><Delete fontSize="small" /></IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* ── PESTAÑA PRODUCTOS ─────────────────────── */}
        {tab === "productos" && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                placeholder="Buscar productos..."
                value={searchProd}
                onChange={e => setSearchProd(e.target.value)}
                size="small"
                sx={{ minWidth: 300, flexGrow: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  label="Categoría"
                  value={catFilterProd === "" ? "all" : catFilterProd}
                  onChange={e => setCatFilterProd(e.target.value === "all" ? "" : e.target.value)}
                >
                  <MenuItem value="all">Todas</MenuItem>
                  {categorias.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Add />} onClick={() => abrirProdDialog()} sx={{ height: 40 }}>
                Nuevo Producto
              </Button>
            </Box>

            {loading ? (
              <Typography sx={{ color: "#a0a0a0", textAlign: "center", py: 8 }}>Cargando...</Typography>
            ) : paginatedProductos.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Inventory sx={{ fontSize: 60, color: "#333", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#a0a0a0" }}>No se encontraron productos</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => abrirProdDialog()} sx={{ mt: 2 }}>
                  Crear primer producto
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} sx={{ background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ "& th": { color: "#a0a0a0", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" } }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Imagen</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell>Precio</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedProductos.map(p => {
                        const catNombre = categorias.find(c => c.id === p.categoria_id)?.nombre || p.categoria_id;
                        return (
                          <TableRow key={p.id} onClick={() => navigate(`/producto/${p.id}`)} sx={{ cursor: "pointer", "&:hover": { background: "rgba(255,255,255,0.03)" } }}>
                            <TableCell sx={{ fontFamily: "Roboto Mono", fontSize: "0.85rem" }}>#{p.id}</TableCell>
                            <TableCell>
                              {p.imagen ? (
                                <Box sx={{ width: 48, height: 48, borderRadius: 1, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                                  <img src={p.imagen} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                                </Box>
                              ) : (
                                <Box sx={{ width: 48, height: 48, borderRadius: 1, background: "#111", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#444" }}>N/A</Typography>
                                </Box>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, color: "#e8e8e8" }}>{p.nombre}</Typography>
                              <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{p.origen || ""}</Typography>
                            </TableCell>
                            <TableCell><Chip label={catNombre} size="small" sx={{ background: "rgba(139,105,20,0.2)", color: "#8b6914" }} /></TableCell>
                            <TableCell sx={{ fontFamily: "Roboto Mono", color: "#8b6914" }}>S/ {Number(p.precio).toFixed(2)}</TableCell>
                            <TableCell>
                              <Chip
                                label={p.stock}
                                size="small"
                                sx={{
                                  background: p.stock === 0 ? "rgba(244,67,54,0.2)" : p.stock < 10 ? "rgba(255,152,0,0.2)" : "rgba(76,175,80,0.2)",
                                  color: p.stock === 0 ? "#f44336" : p.stock < 10 ? "#ff9800" : "#4caf50",
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={e => { e.stopPropagation(); abrirProdDialog(p); }} sx={{ color: "#8b6914" }}><Edit fontSize="small" /></IconButton>
                              <IconButton size="small" onClick={e => { e.stopPropagation(); eliminarProducto(p); }} sx={{ color: "#f44336" }}><Delete fontSize="small" /></IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                  <Typography variant="body2" sx={{ color: "#a0a0a0" }}>
                    Mostrando {(page * rowsPerPage) + 1}-{Math.min((page + 1) * rowsPerPage, produtosFiltrados.length)} de {produtosFiltrados.length} productos
                  </Typography>
                  <Pagination
                    count={Math.ceil(produtosFiltrados.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(_, v) => setPage(v - 1)}
                    color="primary"
                    sx={{ "& .MuiPaginationItem-root": { color: "#a0a0a0" } }}
                  />
                </Box>
              </>
            )}
          </Box>
        )}

        {/* ── DIÁLOGO CATEGORÍA ─────────────────────── */}
        <Dialog open={catDialog.open} onClose={() => setCatDialog({ open: false, edit: null })} PaperProps={{ sx: { background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", minWidth: 400 } }}>
          <DialogTitle sx={{ color: "#e8e8e8", fontFamily: "Montserrat", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {catDialog.edit ? "Editar Categoría" : "Nueva Categoría"}
            <IconButton onClick={() => setCatDialog({ open: false, edit: null })} sx={{ color: "#a0a0a0" }}><Close /></IconButton>
          </DialogTitle>
          <DialogContent>
            {/* El ID se genera automáticamente en el backend (Supabase) */}
            <TextField
              fullWidth label="Nombre" value={catForm.nombre} onChange={e => setCatForm(f => ({ ...f, nombre: e.target.value }))}
              sx={{ mb: 2 }}
              required
              InputLabelProps={{ shrink: true, sx: { zIndex: 1 } }}
            />
            <TextField
              fullWidth label="Descripción" value={catForm.descripcion} onChange={e => setCatForm(f => ({ ...f, descripcion: e.target.value }))}
              multiline rows={2}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCatDialog({ open: false, edit: null })} sx={{ color: "#a0a0a0" }}>Cancelar</Button>
            <Button variant="contained" startIcon={<Save />} onClick={guardarCategoria}>
              {catDialog.edit ? "Actualizar" : "Crear"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DIÁLOGO PRODUCTO ──────────────────────── */}
        <Dialog open={prodDialog.open} onClose={() => setProdDialog({ open: false, edit: null })} PaperProps={{ sx: { background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", minWidth: 520, maxWidth: 600 } }} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: "#e8e8e8", fontFamily: "Montserrat", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {prodDialog.edit ? "Editar Producto" : "Nuevo Producto"}
            <IconButton onClick={() => setProdDialog({ open: false, edit: null })} sx={{ color: "#a0a0a0" }}><Close /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Nombre *" value={prodForm.nombre} onChange={e => setProdForm(f => ({ ...f, nombre: e.target.value }))} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Categoría *</InputLabel>
                  <Select label="Categoría *" value={prodForm.categoria_id} onChange={e => setProdForm(f => ({ ...f, categoria_id: e.target.value }))}>
                    {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Stock" type="number" value={prodForm.stock} onChange={e => setProdForm(f => ({ ...f, stock: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Precio (S/) *" type="number" inputProps={{ step: "0.01" }} value={prodForm.precio} onChange={e => setProdForm(f => ({ ...f, precio: e.target.value }))} required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Precio Anterior (S/)" type="number" inputProps={{ step: "0.01" }} value={prodForm.precio_anterior} onChange={e => setProdForm(f => ({ ...f, precio_anterior: e.target.value }))} />
              </Grid>
              {/* Precios por presentación */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ color: "#a0a0a0", mb: 1 }}>Precios por presentación (opcional)</Typography>
                {prodPrecios.map((pp, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                    <TextField size="small" label="Cantidad" type="number" value={pp.cantidad} onChange={e => { const copy = [...prodPrecios]; copy[i] = { ...copy[i], cantidad: e.target.value }; setProdPrecios(copy); }} sx={{ width: 90 }} />
                    <FormControl size="small" sx={{ width: 110 }}>
                      <Select value={pp.unidad || "g"} onChange={e => { const copy = [...prodPrecios]; copy[i] = { ...copy[i], unidad: e.target.value }; setProdPrecios(copy); }}>
                        <MenuItem value="g">Gramos (g)</MenuItem>
                        <MenuItem value="kg">Kilos (kg)</MenuItem>
                        <MenuItem value="unidades">Unidades</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField size="small" label="Precio S/" type="number" inputProps={{ step: "0.01" }} value={pp.precio} onChange={e => { const copy = [...prodPrecios]; copy[i] = { ...copy[i], precio: e.target.value }; setProdPrecios(copy); }} sx={{ width: 120 }} />
                    <IconButton size="small" onClick={() => setProdPrecios(prodPrecios.filter((_, j) => j !== i))} sx={{ color: "#f44336" }}><Delete /></IconButton>
                  </Box>
                ))}
                <Button size="small" startIcon={<Add />} onClick={() => setProdPrecios([...prodPrecios, { cantidad: "", unidad: "g", precio: "" }])} sx={{ color: "#8b6914" }}>Agregar presentación</Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<Add />}
                  sx={{ height: 40, color: "#e8e8e8", borderColor: "#444", mb: 1 }}
                >
                  {prodImagenFile ? "Cambiar archivo" : "Seleccionar archivo"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setProdImagenFile(file);
                    }}
                  />
                </Button>
                {prodImagenFile && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", maxHeight: 200, display: "flex", justifyContent: "center", background: "#111" }}>
                      <img src={URL.createObjectURL(prodImagenFile)} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#4caf50", display: "block", mt: 0.5 }}>✓ {prodImagenFile.name}</Typography>
                  </Box>
                )}
                {prodForm.imagen && !prodImagenFile && (
                  <Box sx={{ mt: 1 }}>
                    <img src={prodForm.imagen} alt="actual" style={{ maxWidth: 200, maxHeight: 100, objectFit: "contain", borderRadius: 4 }} />
                    <Typography variant="caption" sx={{ color: "#a0a0a0", display: "block", mt: 0.5 }}>Imagen actual (dejar vacío para cambiar)</Typography>
                  </Box>
                )}
              </Grid>
              {prodForm.imagen && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", maxHeight: 200, display: "flex", justifyContent: "center", background: "#111" }}>
                    <img src={prodForm.imagen} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Descripción" multiline rows={3} value={prodForm.descripcion} onChange={e => setProdForm(f => ({ ...f, descripcion: e.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <TextField fullWidth label="Cantidad" value={prodForm.peso} onChange={e => setProdForm(f => ({ ...f, peso: e.target.value }))} sx={{ flex: 1 }} />
                  <FormControl size="small" sx={{ minWidth: 120, mt: 0.5 }}>
                    <Select value={prodForm.peso_unidad || "g"} onChange={e => setProdForm(f => ({ ...f, peso_unidad: e.target.value }))}>
                      <MenuItem value="g">Gramos (g)</MenuItem>
                      <MenuItem value="kg">Kilos (kg)</MenuItem>
                      <MenuItem value="unidades">Unidades</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Origen" value={prodForm.origen} onChange={e => setProdForm(f => ({ ...f, origen: e.target.value }))} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setProdDialog({ open: false, edit: null })} sx={{ color: "#a0a0a0" }}>Cancelar</Button>
            <Button variant="contained" startIcon={<Save />} onClick={guardarProducto}>
              {prodDialog.edit ? "Actualizar" : "Crear"} Producto
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DIÁLOGO ELIMINAR ─────────────────────────────── */}
        <Dialog open={deleteState.open} onClose={handleDeleteCancel} PaperProps={{ sx: { background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", minWidth: 400 } }}>
          <DialogTitle sx={{ color: "#e8e8e8", fontFamily: "Montserrat", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            Confirmar eliminación
            <IconButton onClick={handleDeleteCancel} sx={{ color: "#a0a0a0" }}><Close /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ color: "#e8e8e8" }}>
              ¿Estás seguro de que deseas eliminar {deleteState.type === 'categoria' ? 'la categoría' : deleteState.type === 'producto' ? 'el producto' : 'el usuario'} 
              <strong>{deleteState.item?.nombre ?? ''}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleDeleteCancel} sx={{ color: "#a0a0a0" }}>Cancelar</Button>
            <Button variant="contained" color="error" startIcon={<Delete />} onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}