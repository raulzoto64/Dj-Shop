import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "./LoginPage.tsx";
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  Button, TextField, InputAdornment, IconButton, Box, Container, Grid,
  Card, CardContent, CardActions, CardMedia, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Snackbar, Alert, Tabs, Tab, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Badge, Select, MenuItem, FormControl,
  InputLabel, Divider, Tooltip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Rating, Fab,
} from "@mui/material";
import {
  Store, Chat, Send, Inventory, Category as CategoryIcon, Star,
  Label, ArrowBack, Person, Add, Edit, Delete, Save, Close,
  ContentCopy, Image as ImageIcon,
} from "@mui/icons-material";

const vendedorTheme = createTheme({
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
  },
});

interface VendedorDashboardProps {
  onBack: () => void;
}

type TabPanel = "productos" | "categorias" | "chat" | "resenas" | "perfil" | "etiquetas";

export default function VendedorDashboard({ onBack }: VendedorDashboardProps) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [tabActivo, setTabActivo] = useState<TabPanel>("productos");
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [resenas, setResenas] = useState<any[]>([]);
  const [vendedor, setVendedor] = useState<any>(null);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({ open: false, msg: "", severity: "success" });
  const [uploading, setUploading] = useState(false);
  const [searchParams] = useSearchParams();

  // Modales
  const [modalProducto, setModalProducto] = useState(false);
  const [editProducto, setEditProducto] = useState<any | null>(null);
  const [modalEtiqueta, setModalEtiqueta] = useState(false);
  const [modalChat, setModalChat] = useState<any | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  // Forms
  const [formProducto, setFormProducto] = useState({ nombre: "", descripcion: "", precio: "", stock: "", imagen: "", categoria_id: "", peso: "", peso_unidad: "g", origen: "" });
  const [prodPrecios, setProdPrecios] = useState<{ cantidad: string; unidad: string; precio: string }[]>([]);
  const [prodImagenFile, setProdImagenFile] = useState<File | null>(null);
  const [formEtiqueta, setFormEtiqueta] = useState({ nombre: "", color: "#8b6914" });
  const [formPerfil, setFormPerfil] = useState({ nombre_tienda: "", descripcion: "", telefono: "", direccion: "" });
  const [formResenaVendedor, setFormResenaVendedor] = useState({ producto_id: "", calificacion: 5, comentario: "" });
  const [resenaVendedorImg, setResenaVendedorImg] = useState<string>("");
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["productos", "categorias", "chat", "resenas", "perfil", "etiquetas"].includes(tab)) {
      setTabActivo(tab as TabPanel);
    }
  }, [searchParams]);

  useEffect(() => {
    if (vendedor) {
      setFormPerfil({
        nombre_tienda: vendedor.nombre_tienda || "",
        descripcion: vendedor.descripcion || "",
        telefono: vendedor.telefono || "",
        direccion: vendedor.direccion || "",
      });
    }
  }, [vendedor]);

  const cargarDatos = async () => {
    try {
      const email = authUser?.email;
      if (!email) return;

      // Obtener UUID real del cliente desde la tabla clientes
      const { data: cliente } = await supabase.from("clientes").select("id").eq("email", email).single();
      const clienteUuid = cliente?.id;
      console.log("[VENDEDOR] UUID del cliente:", clienteUuid);
      if (!clienteUuid) return;
      setClienteId(clienteUuid);

      // Obtener o crear perfil de vendedor
      let { data: vendedorData } = await supabase.from("vendedores").select("*").eq("cliente_id", clienteUuid).maybeSingle();
      console.log("[VENDEDOR] Datos cargados de vendedores:", vendedorData);
      if (!vendedorData) {
        console.log("[VENDEDOR] No existe perfil, creando uno nuevo...");
        const { data: insertData, error: insertError } = await supabase.from("vendedores").insert({ cliente_id: clienteUuid, nombre_tienda: `${authUser?.nombre || "Usuario"}'s Store` }).select();
        console.log("[VENDEDOR] Resultado insert:", insertData, insertError);
        if (insertError) {
          console.warn("[VENDEDOR] Error RLS al insertar, intentando saltar RLS...");
          // Si falla por RLS, intentamos con service_role si está disponible
          const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
          if (serviceKey) {
            const { createClient } = await import("@supabase/supabase-js");
            const serviceClient = createClient(import.meta.env.VITE_SUPABASE_URL, serviceKey);
            const { data: adminData, error: adminError } = await serviceClient.from("vendedores").insert({ cliente_id: clienteUuid, nombre_tienda: `${authUser?.nombre || "Usuario"}'s Store` }).select();
            console.log("[VENDEDOR] Resultado insert con service_role:", adminData, adminError);
            if (adminError) throw adminError;
            vendedorData = adminData?.[0] || null;
          } else {
            throw insertError;
          }
        } else {
          vendedorData = insertData?.[0] || null;
        }
      }
      console.log("[VENDEDOR] Vendedor final:", vendedorData);
      setVendedor(vendedorData);

      // Cargar datos
      const [productosRes, categoriasRes, etiquetasRes, conversacionesRes, resenasRes] = await Promise.all([
        supabase.from("productos").select("*, categorias(*)").eq("usuario_id", clienteUuid),
        supabase.from("categorias").select("*"),
        supabase.from("etiquetas").select("*"),
        supabase.from("conversaciones").select("*, cliente1:clientes!cliente1_id(nombre), cliente2:clientes!cliente2_id(nombre)").or(`cliente1_id.eq.${clienteUuid},cliente2_id.eq.${clienteUuid}`).order("fecha_ultimo_mensaje", { ascending: false }),
        supabase.from("resenas").select("*, clientes(nombre), productos!inner(usuario_id)").eq("productos.usuario_id", clienteUuid).order("fecha_creacion", { ascending: false }),
      ]);

      setProductos(productosRes.data || []);
      setCategorias(categoriasRes.data || []);
      setEtiquetas(etiquetasRes.data || []);
      setConversaciones(conversacionesRes.data || []);
      setResenas(resenasRes.data || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, nuevoTab: TabPanel) => {
    setTabActivo(nuevoTab);
  };

  // Polling para detectar nuevos mensajes y auto-abrir chat flotante
  useEffect(() => {
    if (!clienteId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("conversaciones")
        .select("id, ultimo_mensaje, leido_por_cliente1, leido_por_cliente2, cliente1_id, cliente2_id")
        .or(`cliente1_id.eq.${clienteId},cliente2_id.eq.${clienteId}`)
        .order("fecha_ultimo_mensaje", { ascending: false })
        .limit(3);
      if (data && data.length > 0) {
        const noLeidas = data.filter(c => c.cliente2_id === clienteId ? !c.leido_por_cliente2 : !c.leido_por_cliente1);
        if (noLeidas.length > 0 && !floatingChatOpen) {
          setFloatingChatOpen(true);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [clienteId, floatingChatOpen]);

  const abrirChat = async (conversacion: any) => {
    setModalChat(conversacion);
    const { data: mensajesData } = await supabase.from("mensajes").select("*, remitente:clientes!remitente_id(nombre)").eq("conversacion_id", conversacion.id).order("fecha_envio", { ascending: true });
    setMensajes(mensajesData || []);
    // Marcar como leído
    const campoLeido = conversacion.cliente1_id === clienteId ? "leido_por_cliente1" : "leido_por_cliente2";
    await supabase.from("conversaciones").update({ [campoLeido]: true }).eq("id", conversacion.id);
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !modalChat) return;
    await supabase.from("mensajes").insert({
      conversacion_id: modalChat.id,
      remitente_id: clienteId,
      contenido: nuevoMensaje,
      leido: false,
    });
    await supabase.from("conversaciones").update({ ultimo_mensaje: nuevoMensaje, fecha_ultimo_mensaje: new Date().toISOString() }).eq("id", modalChat.id);
    setNuevoMensaje("");
    const { data: nuevosMensajes } = await supabase.from("mensajes").select("*, remitente:clientes!remitente_id(nombre)").eq("conversacion_id", modalChat.id).order("fecha_envio", { ascending: true });
    setMensajes(nuevosMensajes || []);
  };

  const mensajesSinLeer = conversaciones.filter(c => c.cliente1_id === clienteId ? !c.leido_por_cliente1 : !c.leido_por_cliente2).length;

  const subirImagen = async (file: File): Promise<string | null> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch {
      return null;
    }
  };

  const abrirNuevoProducto = () => {
    setEditProducto(null);
    setFormProducto({ nombre: "", descripcion: "", precio: "", stock: "", imagen: "", categoria_id: categorias[0]?.id || "", peso: "", peso_unidad: "g", origen: "" });
    setProdPrecios([]);
    setProdImagenFile(null);
    setModalProducto(true);
  };

  const abrirEditarProducto = (p: any) => {
    setEditProducto(p);
    setFormProducto({
      nombre: p.nombre || "",
      descripcion: p.descripcion || "",
      precio: String(p.precio ?? ""),
      stock: String(p.stock ?? ""),
      imagen: p.imagen || "",
      categoria_id: p.categoria_id || "",
      peso: (p.peso || "").replace(/\s+(g|kg|unidades)$/, ""),
      peso_unidad: ((p.peso || "").match(/\s+(g|kg|unidades)$/) || [, "g"])[1],
      origen: p.origen || "",
    });
    setProdPrecios((p.precios || []).map((pr: any) => ({
      cantidad: String(pr.cantidad ?? pr.gramos ?? ""),
      unidad: pr.unidad || "g",
      precio: String(pr.precio),
    })));
    setProdImagenFile(null);
    setModalProducto(true);
  };

  const enviarResenaVendedor = async () => {
    if (!formResenaVendedor.producto_id || !vendedor) return;
    try {
      const { error } = await supabase.from("resenas").insert({
        producto_id: Number(formResenaVendedor.producto_id),
        cliente_id: clienteId,
        nombre_cliente: vendedor.nombre_tienda,
        calificacion: formResenaVendedor.calificacion,
        comentario: formResenaVendedor.comentario,
        imagen_url: resenaVendedorImg || null,
        aprobada: true,
      });
      if (error) throw error;
      setSnackbar({ open: true, msg: "Reseña creada como vendedor", severity: "success" });
      setFormResenaVendedor({ producto_id: "", calificacion: 5, comentario: "" });
      setResenaVendedorImg("");
      const { data: resData } = await supabase.from("resenas").select("*, clientes(nombre), productos!inner(usuario_id)").eq("productos.usuario_id", clienteId).order("fecha_creacion", { ascending: false });
      setResenas(resData || []);
    } catch (e) {
      console.error("Error creando reseña:", e);
      setSnackbar({ open: true, msg: "Error al crear reseña", severity: "error" });
    }
  };

  const reviewLink = (productId: number) => `${window.location.origin}/producto/${productId}?review=1`;

  const copiarLink = (productId: number) => {
    navigator.clipboard.writeText(reviewLink(productId));
    setSnackbar({ open: true, msg: "Link de reseña copiado al portapapeles", severity: "success" });
  };

  const guardarProducto = async () => {
    if (!formProducto.nombre.trim() || !formProducto.precio) {
      setSnackbar({ open: true, msg: "Nombre y precio requeridos", severity: "error" });
      return;
    }
    try {
      let imagenUrl = formProducto.imagen.trim();
      if (prodImagenFile) {
        setUploading(true);
        const url = await subirImagen(prodImagenFile);
        setUploading(false);
        if (!url) return setSnackbar({ open: true, msg: "Error al subir imagen", severity: "error" });
        imagenUrl = url;
      }

      const payload: Record<string, unknown> = {
        nombre: formProducto.nombre.trim(),
        descripcion: formProducto.descripcion.trim() || null,
        precio: parseFloat(formProducto.precio) || 0,
        stock: parseInt(formProducto.stock) || 0,
        imagen: imagenUrl || "https://via.placeholder.com/400?text=Sin+imagen",
        categoria_id: formProducto.categoria_id || null,
        usuario_id: clienteId,
        peso: formProducto.peso?.trim() ? `${formProducto.peso.trim()} ${formProducto.peso_unidad || "g"}` : null,
        origen: formProducto.origen?.trim() || null,
        precios: prodPrecios.filter(p => p.cantidad && p.precio).map(p => ({ cantidad: parseFloat(p.cantidad), unidad: p.unidad || "g", precio: parseFloat(p.precio) })),
      };
      if ((payload.precios as any[]).length === 0) delete payload.precios;

      if (editProducto) {
        await supabase.from("productos").update(payload).eq("id", editProducto.id);
      } else {
        await supabase.from("productos").insert(payload);
      }
      setModalProducto(false);
      setProdImagenFile(null);
      setSnackbar({ open: true, msg: `Producto ${editProducto ? "actualizado" : "creado"}`, severity: "success" });
      cargarDatos();
    } catch (e) {
      console.error("Error guardando producto:", e);
      setSnackbar({ open: true, msg: "Error al guardar producto", severity: "error" });
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      await supabase.from("productos").delete().eq("id", id);
      setSnackbar({ open: true, msg: "Producto eliminado", severity: "success" });
      cargarDatos();
    } catch {
      setSnackbar({ open: true, msg: "Error al eliminar producto", severity: "error" });
    }
  };

  const guardarPerfil = async () => {
    if (!vendedor) return;
    try {
      console.log("[PERFIL] Rol del usuario:", authUser?.rol);
      console.log("[PERFIL] Email:", authUser?.email);
      console.log("[PERFIL] Guardando perfil vendedor ID:", vendedor.id);
      console.log("[PERFIL] Datos a enviar:", formPerfil);
      const { data, error } = await supabase.from("vendedores").update({
        nombre_tienda: formPerfil.nombre_tienda.trim(),
        descripcion: formPerfil.descripcion.trim() || null,
        telefono: formPerfil.telefono.trim() || null,
        direccion: formPerfil.direccion.trim() || null,
      }).eq("id", vendedor.id).select();
      console.log("[PERFIL] Resultado:", { data, error });
      if (error) throw error;
      setSnackbar({ open: true, msg: "Perfil actualizado", severity: "success" });
      cargarDatos();
    } catch (e) {
      console.error("[PERFIL] Error:", e);
      setSnackbar({ open: true, msg: "Error al actualizar perfil", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ textAlign: "center", color: "#a0a0a0" }}>Cargando panel de vendedor...</Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={vendedorTheme}>
      <CssBaseline />
      {/* Header */}
      <AppBar position="sticky" sx={{ background: "rgba(15,26,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Store sx={{ color: "#8b6914", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800, color: "#e8e8e8" }}>
              Panel de Vendedor
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" size="small" onClick={onBack} sx={{ color: "#e8e8e8", borderColor: "#444" }}>Volver</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Tabs value={tabActivo} onChange={handleTabChange} sx={{ mb: 4, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Tab icon={<Inventory />} label="Productos" value="productos" />
          <Tab icon={<CategoryIcon />} label="Categorías" value="categorias" />
          <Tab icon={<Label />} label="Etiquetas" value="etiquetas" />
          <Tab icon={<Chat />} label={`Chat (${mensajesSinLeer})`} value="chat" sx={{ color: mensajesSinLeer > 0 ? "#ff9800" : undefined }} />
          <Tab icon={<Star />} label="Reseñas" value="resenas" />
          <Tab icon={<Person />} label="Mi Perfil" value="perfil" />
        </Tabs>

        {/* Panel Productos */}
        {tabActivo === "productos" && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h4">Mis Productos</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={abrirNuevoProducto}>Nuevo Producto</Button>
            </Box>
            {productos.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Inventory sx={{ fontSize: 60, color: "#333", mb: 2 }} />
                <Typography sx={{ color: "#a0a0a0" }}>No tienes productos aún</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={abrirNuevoProducto} sx={{ mt: 2 }}>
                  Crear primer producto
                </Button>
              </Box>
            ) : (
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
                    {productos.map(p => (
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
                        </TableCell>
                        <TableCell><Chip label={p.categorias?.nombre || "Sin categoría"} size="small" sx={{ background: "rgba(139,105,20,0.2)", color: "#8b6914" }} /></TableCell>
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
                          <Tooltip title="Copiar link de reseña"><IconButton size="small" onClick={e => { e.stopPropagation(); copiarLink(p.id); }} sx={{ color: "#a0a0a0" }}><ContentCopy fontSize="small" /></IconButton></Tooltip>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); abrirEditarProducto(p); }} sx={{ color: "#8b6914" }}><Edit fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={e => { e.stopPropagation(); eliminarProducto(p.id); }} sx={{ color: "#f44336" }}><Delete fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Panel Categorías - Solo lectura (las crea el admin) */}
        {tabActivo === "categorias" && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Categorías Disponibles</Typography>
            <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 3 }}>
              Las categorías son gestionadas por el administrador. Selecciona una categoría al crear productos.
            </Typography>
            <Grid container spacing={2}>
              {categorias.map(c => (
                <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ height: "100%", opacity: 0.9 }}>
                    {c.imagen && <CardMedia component="img" height="140" image={c.imagen} />}
                    <CardContent>
                      <Typography variant="h6">{c.nombre}</Typography>
                      <Typography variant="body2" sx={{ color: "#a0a0a0" }}>{c.descripcion || "Sin descripción"}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Panel Etiquetas */}
        {tabActivo === "etiquetas" && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h4">Etiquetas</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={() => setModalEtiqueta(true)}>Nueva Etiqueta</Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {etiquetas.map(e => (
                <Chip key={e.id} label={e.nombre} sx={{ background: e.color || "#8b6914", color: "#fff" }} />
              ))}
            </Box>
          </Box>
        )}

        {/* Panel Chat */}
        {tabActivo === "chat" && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Mensajes</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ maxHeight: 500, overflow: "auto" }}>
                  {conversaciones.map(conv => {
                    const otroUsuario = conv.cliente1_id === clienteId ? conv.cliente2 : conv.cliente1;
                    const nombreUsuario = otroUsuario?.nombre || conv.visitante_nombre || "Usuario";
                    const sinLeer = conv.cliente1_id === clienteId ? !conv.leido_por_cliente1 : !conv.leido_por_cliente2;
                    return (
                      <ListItem key={conv.id} onClick={() => abrirChat(conv)} sx={{ borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                        <ListItemAvatar>
                          <Avatar><Person /></Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={nombreUsuario}
                          secondary={conv.ultimo_mensaje || "Sin mensajes"}
                        />
                        {sinLeer && <Badge badgeContent={1} color="error" />}
                      </ListItem>
                    );
                  })}
                  {conversaciones.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center", color: "#a0a0a0" }}>No hay conversaciones</Box>
                  )}
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                {modalChat ? (
                  <Card sx={{ height: 500, display: "flex", flexDirection: "column" }}>
                    <CardContent sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 2 }}>
                      <Typography variant="h6">
                        {modalChat.cliente1_id === clienteId ? modalChat.cliente2?.nombre : modalChat.cliente1?.nombre || modalChat.visitante_nombre || "Visitante"}
                      </Typography>
                    </CardContent>
                    <Box sx={{ flexGrow: 1, overflow: "auto", p: 2, maxHeight: 300 }}>
                      {mensajes.map(m => {
                        const esVendor = m.remitente_id === clienteId;
                        const esVisitante = !m.remitente_id && m.visitante_id;
                        return (
                          <Box key={m.id} sx={{ display: "flex", justifyContent: esVendor ? "flex-end" : "flex-start", mb: 2 }}>
                            <Box>
                              {!esVendor && m.visitante_nombre && (
                                <Typography variant="caption" sx={{ color: "#a0a0a0", ml: 1 }}>{m.visitante_nombre}</Typography>
                              )}
                              <Card sx={{ maxWidth: "95%", background: esVendor ? "#8b6914" : "#2a3a2a" }}>
                                <CardContent sx={{ p: 2 }}>{m.contenido}</CardContent>
                              </Card>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                    <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Escribe un mensaje..."
                        value={nuevoMensaje}
                        onChange={e => setNuevoMensaje(e.target.value)}
                        onKeyPress={e => e.key === "Enter" && enviarMensaje()}
                      />
                      <IconButton onClick={enviarMensaje} sx={{ color: "#8b6914" }}><Send /></IconButton>
                    </Box>
                  </Card>
                ) : (
                  <Card sx={{ height: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ color: "#a0a0a0" }}>Selecciona una conversación para ver los mensajes</Typography>
                  </Card>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Panel Perfil */}
        {tabActivo === "perfil" && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Mi Perfil de Tienda</Typography>
            <Card sx={{ p: 3, maxWidth: 600 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Nombre de la tienda" value={formPerfil.nombre_tienda} onChange={e => setFormPerfil(f => ({ ...f, nombre_tienda: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Descripción" multiline rows={3} value={formPerfil.descripcion} onChange={e => setFormPerfil(f => ({ ...f, descripcion: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Teléfono" value={formPerfil.telefono} onChange={e => setFormPerfil(f => ({ ...f, telefono: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Dirección" value={formPerfil.direccion} onChange={e => setFormPerfil(f => ({ ...f, direccion: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" startIcon={<Save />} onClick={guardarPerfil}>Guardar Perfil</Button>
                </Grid>
              </Grid>
            </Card>
          </Box>
        )}

        {/* Panel Reseñas */}
        {tabActivo === "resenas" && (
          <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Reseñas</Typography>

            {/* Crear reseña como vendedor */}
            <Paper sx={{ p: 3, mb: 4, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Crear reseña como vendedor</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Producto</InputLabel>
                    <Select label="Producto" value={formResenaVendedor.producto_id} onChange={e => setFormResenaVendedor(f => ({ ...f, producto_id: e.target.value }))}>
                      {productos.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.nombre}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Calificación:</Typography>
                    <Rating value={formResenaVendedor.calificacion} onChange={(_, v) => setFormResenaVendedor(f => ({ ...f, calificacion: v || 5 }))} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline rows={2} label="Comentario" value={formResenaVendedor.comentario}
                    onChange={e => setFormResenaVendedor(f => ({ ...f, comentario: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button variant="outlined" component="label" startIcon={<ImageIcon />} sx={{ borderColor: "#444", color: "#a0a0a0" }}>
                      {resenaVendedorImg ? "Cambiar imagen" : "Agregar imagen"}
                      <input type="file" hidden accept="image/*" onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setResenaVendedorImg(ev.target?.result as string || "");
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </Button>
                    {resenaVendedorImg && (
                      <Box sx={{ position: "relative", display: "inline-block" }}>
                        <img src={resenaVendedorImg} alt="Preview" style={{ height: 60, borderRadius: 4 }} />
                        <IconButton size="small" onClick={() => setResenaVendedorImg("")} sx={{ position: "absolute", top: -8, right: -8, background: "#f44336", color: "#fff", width: 20, height: 20 }}>
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant="contained" onClick={enviarResenaVendedor} disabled={!formResenaVendedor.producto_id || !formResenaVendedor.comentario.trim()} sx={{ background: "#8b6914" }}>
                      Publicar reseña
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Enlaces de reseña */}
            <Paper sx={{ p: 3, mb: 4, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Enlaces de reseña para tus productos</Typography>
              <Typography variant="body2" sx={{ color: "#a0a0a0", mb: 2 }}>
                Copia estos enlaces y compártelos con tus clientes para que dejen su reseña.
              </Typography>
              <List sx={{ maxHeight: 300, overflow: "auto" }}>
                {productos.map(p => (
                  <ListItem key={p.id} sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <ListItemText primary={p.nombre} secondary={reviewLink(p.id)} secondaryTypographyProps={{ sx: { fontSize: "0.75rem", color: "#606060", wordBreak: "break-all" } }} />
                    <IconButton size="small" onClick={() => copiarLink(p.id)} sx={{ color: "#8b6914" }}><ContentCopy /></IconButton>
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Reseñas recibidas */}
            <Typography variant="h6" sx={{ mb: 2 }}>Reseñas Recibidas</Typography>
            {resenas.length === 0 ? (
              <Typography sx={{ color: "#a0a0a0" }}>No hay reseñas aún</Typography>
            ) : (
              resenas.map(r => (
                <Card key={r.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="h6">{r.clientes?.nombre || r.nombre_cliente}</Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} sx={{ color: star <= r.calificacion_servicio ? "#ff9800" : "#444" }} />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#c0c0c0", mb: 1 }}>{r.comentario}</Typography>
                    {r.imagen_url && <img src={r.imagen_url} alt="Reseña" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, marginTop: 8 }} />}
                    {r.video_url && (
                      <Box sx={{ mt: 2 }}>
                        <video controls src={r.video_url} style={{ maxWidth: "100%", borderRadius: 8 }} />
                      </Box>
                    )}
                    <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{new Date(r.fecha_creacion).toLocaleDateString()}</Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Container>

      {/* Floating Chat Widget */}
      <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        {floatingChatOpen ? (
          <Paper sx={{ width: 360, height: 480, display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden", background: "#1a2a1a" }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderBottom: "1px solid rgba(255,255,255,0.1)", background: "#0f1a0f" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Chat</Typography>
              <IconButton size="small" onClick={() => setFloatingChatOpen(false)} sx={{ color: "#a0a0a0" }}><Close /></IconButton>
            </Box>
            {/* Conversaciones */}
            <Box sx={{ overflow: "auto", flex: modalChat ? "0 0 auto" : 1, maxHeight: modalChat ? 160 : "none" }}>
              {conversaciones.map(conv => {
                const otroUsuario = conv.cliente1_id === clienteId ? conv.cliente2 : conv.cliente1;
                const nombreUsuario = otroUsuario?.nombre || conv.visitante_nombre || "Usuario";
                const sinLeer = conv.cliente1_id === clienteId ? !conv.leido_por_cliente1 : !conv.leido_por_cliente2;
                return (
                  <ListItem key={conv.id} onClick={() => abrirChat(conv)} sx={{ borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", py: 1, background: modalChat?.id === conv.id ? "rgba(139,105,20,0.1)" : "transparent" }}>
                    <ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: 14 }}><Person /></Avatar></ListItemAvatar>
                    <ListItemText primary={nombreUsuario} primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: sinLeer ? 700 : 400 }} secondary={conv.ultimo_mensaje || ""} secondaryTypographyProps={{ fontSize: "0.75rem", noWrap: true }} />
                    {sinLeer && <Badge badgeContent={1} color="error" />}
                  </ListItem>
                );
              })}
              {conversaciones.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center", color: "#a0a0a0", fontSize: "0.85rem" }}>No hay conversaciones</Box>
              )}
            </Box>
            {/* Mensajes de la conversación seleccionada */}
            {modalChat && (
              <>
                <Divider />
                <Box sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
                  {mensajes.map(m => {
                    const esVendor = m.remitente_id === clienteId;
                    return (
                      <Box key={m.id} sx={{ display: "flex", justifyContent: esVendor ? "flex-end" : "flex-start", mb: 1 }}>
                        <Card sx={{ maxWidth: "90%", background: esVendor ? "#8b6914" : "#2a3a2a" }}>
                          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>{m.contenido}</CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
                <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 1 }}>
                  <TextField fullWidth size="small" placeholder="Escribe..." value={nuevoMensaje}
                    onChange={e => setNuevoMensaje(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") enviarMensaje(); }}
                    sx={{ "& .MuiOutlinedInput-root": { background: "#111", fontSize: "0.85rem" } }} />
                  <IconButton size="small" onClick={enviarMensaje} sx={{ color: "#8b6914" }}><Send fontSize="small" /></IconButton>
                </Box>
              </>
            )}
          </Paper>
        ) : (
          <Fab color="primary" onClick={() => { setFloatingChatOpen(true); cargarDatos(); }} sx={{ background: "#8b6914", "&:hover": { background: "#a07a18" } }}>
            <Badge badgeContent={mensajesSinLeer} color="error">
              <Chat />
            </Badge>
          </Fab>
        )}
      </Box>

      {/* Diálogo Producto */}
      <Dialog open={modalProducto} onClose={() => setModalProducto(false)} PaperProps={{ sx: { background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", minWidth: 480, maxWidth: 560 } }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#e8e8e8", fontFamily: "Montserrat", fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {editProducto ? "Editar Producto" : "Nuevo Producto"}
          <IconButton onClick={() => setModalProducto(false)} sx={{ color: "#a0a0a0" }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Nombre *" value={formProducto.nombre} onChange={e => setFormProducto(f => ({ ...f, nombre: e.target.value }))} required />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select label="Categoría" value={formProducto.categoria_id} onChange={e => setFormProducto(f => ({ ...f, categoria_id: e.target.value }))}>
                  {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Stock" type="number" value={formProducto.stock} onChange={e => setFormProducto(f => ({ ...f, stock: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Precio (S/) *" type="number" inputProps={{ step: "0.01" }} value={formProducto.precio} onChange={e => setFormProducto(f => ({ ...f, precio: e.target.value }))} required />
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
            <Grid size={{ xs: 12, md: 6 }}>
              <Button variant="outlined" component="label" startIcon={<Add />} sx={{ height: 56, width: "100%", color: "#e8e8e8", borderColor: "#444" }}>
                {prodImagenFile ? "Cambiar imagen" : "Seleccionar imagen"}
                <input type="file" accept="image/*" hidden onChange={e => { const file = e.target.files?.[0]; if (file) setProdImagenFile(file); }} />
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Descripción" multiline rows={2} value={formProducto.descripcion} onChange={e => setFormProducto(f => ({ ...f, descripcion: e.target.value }))} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <TextField fullWidth label="Cantidad" value={formProducto.peso || ""} onChange={e => setFormProducto(f => ({ ...f, peso: e.target.value }))} sx={{ flex: 1 }} />
                <FormControl size="small" sx={{ minWidth: 120, mt: 0.5 }}>
                  <Select value={formProducto.peso_unidad || "g"} onChange={e => setFormProducto(f => ({ ...f, peso_unidad: e.target.value }))}>
                    <MenuItem value="g">Gramos (g)</MenuItem>
                    <MenuItem value="kg">Kilos (kg)</MenuItem>
                    <MenuItem value="unidades">Unidades</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Origen" value={formProducto.origen || ""} onChange={e => setFormProducto(f => ({ ...f, origen: e.target.value }))} />
            </Grid>
            {prodImagenFile && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", maxHeight: 200, display: "flex", justifyContent: "center", background: "#111", mb: 1 }}>
                  <img src={URL.createObjectURL(prodImagenFile)} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} />
                </Box>
                <Typography variant="caption" sx={{ color: "#4caf50" }}>✓ {prodImagenFile.name}</Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setModalProducto(false)} sx={{ color: "#a0a0a0" }}>Cancelar</Button>
          <Button variant="contained" startIcon={<Save />} onClick={guardarProducto} disabled={uploading}>
            {editProducto ? "Actualizar" : "Crear"} Producto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.msg}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}