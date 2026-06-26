import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "./LoginPage.tsx";
import {
  Container, Typography, Box, Grid, Button, IconButton, Chip, Card,
  CardMedia, CardContent, CardActions, Rating, Breadcrumbs, Link,
  Snackbar, Alert, Paper, Divider, FormControl, InputLabel, Select, MenuItem,
  TextField, Avatar, Fab,
} from "@mui/material";
import {
  ArrowBack, ThumbUp, ThumbDown, ShoppingCart, Share, NavigateNext,
  Send, Chat, Image as ImageIcon, Delete, Close,
} from "@mui/icons-material";
import { AppContext } from "./App.tsx";

const EFECTOS = ["tranquilidad", "adrenalina", "euforia", "felicidad", "relajación", "energía", "creatividad", "concentración"];

export default function ProductoPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const resenasRef = useRef<HTMLDivElement>(null);
  const [producto, setProducto] = useState<any>(null);
  const [vendedor, setVendedor] = useState<any>(null);
  const [relacionados, setRelacionados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({ open: false, msg: "", severity: "info" });
  const [voto, setVoto] = useState<"like" | "dislike" | null>(null);
  const [votosCount, setVotosCount] = useState({ like: 0, dislike: 0 });
  const [gramosSel, setGramosSel] = useState<number | null>(null);
  const ctx = useContext(AppContext);

  // Reseñas
  const [resenas, setResenas] = useState<any[]>([]);
  const [nuevaResena, setNuevaResena] = useState({ calificacion: 5, comentario: "" });
  const [resenaImg, setResenaImg] = useState<string>("");
  const [enviandoResena, setEnviandoResena] = useState(false);

  // Mensaje
  const [mensaje, setMensaje] = useState("");
  const [enviandoMsg, setEnviandoMsg] = useState(false);
  const [msgNombre, setMsgNombre] = useState("");
  const [chatConvId, setChatConvId] = useState<string | null>(null);
  const [chatMensajes, setChatMensajes] = useState<any[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgInput, setChatMsgInput] = useState("");

  useEffect(() => {
    if (!id) return;
    cargarProducto();
  }, [id]);

  useEffect(() => {
    if (!loading && searchParams.get("review") === "1" && resenasRef.current) {
      resenasRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, searchParams]);

  const getVisitanteId = () => {
    let vid = localStorage.getItem("visitante_id");
    if (!vid) {
      vid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("visitante_id", vid);
    }
    return vid;
  };

  const cargarProducto = async () => {
    try {
      const { data: prod } = await supabase.from("productos").select("*, categorias(*)").eq("id", id).single();
      if (!prod) return;
      setProducto(prod);

      const { data: vendedorData } = await supabase.from("vendedores").select("*").eq("cliente_id", prod.usuario_id).maybeSingle();
      setVendedor(vendedorData);

      const { data: rel } = await supabase.from("productos").select("*, categorias(*)").eq("categoria_id", prod.categoria_id).neq("id", prod.id).limit(4);
      setRelacionados(rel || []);

      const { data: resData } = await supabase
        .from("resenas")
        .select("*, clientes(nombre)")
        .eq("producto_id", prod.id)
        .order("created_at", { ascending: false });
      setResenas(resData || []);

      // Cargar votos
      await cargarVotos(prod.id);
    } catch (e) {
      console.error("Error cargando producto:", e);
    } finally {
      setLoading(false);
    }
  };

  const cargarVotos = async (productoId: number) => {
    const visitanteId = getVisitanteId();
    const [countsRes, myVoteRes] = await Promise.all([
      supabase.from("votos").select("tipo", { count: "exact", head: false }).eq("producto_id", productoId),
      supabase.from("votos").select("tipo").eq("producto_id", productoId).eq("visitante_id", visitanteId).maybeSingle(),
    ]);
    const likes = countsRes.data?.filter(v => v.tipo === "like").length || 0;
    const dislikes = countsRes.data?.filter(v => v.tipo === "dislike").length || 0;
    setVotosCount({ like: likes, dislike: dislikes });
    setVoto(myVoteRes?.data?.tipo as "like" | "dislike" | null || null);
  };

  const handleVoto = async (tipo: "like" | "dislike") => {
    const visitanteId = getVisitanteId();
    const nuevo = voto === tipo ? null : tipo;
    setVoto(nuevo);
    setVotosCount(prev => {
      const deltaLike = (tipo === "like" ? 1 : 0) - (voto === "like" ? 1 : 0);
      const deltaDislike = (tipo === "dislike" ? 1 : 0) - (voto === "dislike" ? 1 : 0);
      return { like: Math.max(0, prev.like + (nuevo === "like" ? 1 : deltaLike)), dislike: Math.max(0, prev.dislike + (nuevo === "dislike" ? 1 : deltaDislike)) };
    });
    if (!nuevo) {
      await supabase.from("votos").delete().eq("producto_id", Number(id)).eq("visitante_id", visitanteId);
    } else {
      const { error } = await supabase.from("votos").upsert(
        { producto_id: Number(id), visitante_id: visitanteId, tipo: nuevo },
        { onConflict: "producto_id, visitante_id" }
      ).select().maybeSingle();
      if (error) {
        // Revertir si falla
        const [countsRes, myVoteRes] = await Promise.all([
          supabase.from("votos").select("tipo", { count: "exact", head: false }).eq("producto_id", Number(id)),
          supabase.from("votos").select("tipo").eq("producto_id", Number(id)).eq("visitante_id", visitanteId).maybeSingle(),
        ]);
        setVotosCount({ like: countsRes.data?.filter(v => v.tipo === "like").length || 0, dislike: countsRes.data?.filter(v => v.tipo === "dislike").length || 0 });
        setVoto(myVoteRes?.data?.tipo as "like" | "dislike" | null || null);
        setSnack({ open: true, msg: "Error al guardar voto. ¿Creaste la tabla 'votos'?", severity: "error" });
        return;
      }
    }
    setSnack({ open: true, msg: nuevo ? (tipo === "like" ? "¡Gracias por tu voto!" : "Voto registrado") : "Voto eliminado", severity: "success" });
  };

  const enviarResena = async () => {
    if (!producto || !vendedor) return;
    setEnviandoResena(true);
    try {
      const { error } = await supabase.from("resenas").insert({
        producto_id: producto.id,
        calificacion: nuevaResena.calificacion,
        comentario: nuevaResena.comentario,
        imagen_url: resenaImg || null,
        aprobada: true,
      });
      if (error) throw error;
      setSnack({ open: true, msg: "Reseña enviada, ¡gracias!", severity: "success" });
      setNuevaResena({ calificacion: 5, comentario: "" });
      setResenaImg("");
      const { data: resData } = await supabase
        .from("resenas")
        .select("*, clientes(nombre)")
        .eq("producto_id", producto.id)
        .order("created_at", { ascending: false });
      setResenas(resData || []);
    } catch (e) {
      console.error("Error enviando reseña:", JSON.stringify(e));
      setSnack({ open: true, msg: (e as any)?.message || "Error al enviar reseña. Verifica que la tabla resenas permita inserts anónimos.", severity: "error" });
    } finally {
      setEnviandoResena(false);
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim() || !vendedor) return;
    setEnviandoMsg(true);
    try {
      const visitanteId = getVisitanteId();
      const visitanteNombre = msgNombre.trim() || "Visitante";
      let convId: string;

      if (authUser?.email) {
        const { data: cliente } = await supabase.from("clientes").select("id").eq("email", authUser.email).single();
        const remitenteUuid = cliente?.id;
        if (!remitenteUuid || remitenteUuid === vendedor.cliente_id) {
          setSnack({ open: true, msg: remitenteUuid === vendedor.cliente_id ? "No puedes enviarte mensajes a ti mismo" : "No se pudo identificar tu usuario", severity: "error" });
          return;
        }
        const { data: existingConv } = await supabase
          .from("conversaciones")
          .select("id")
          .or(`and(cliente1_id.eq.${remitenteUuid},cliente2_id.eq.${vendedor.cliente_id}),and(cliente1_id.eq.${vendedor.cliente_id},cliente2_id.eq.${remitenteUuid})`)
          .maybeSingle();
        if (existingConv) {
          convId = existingConv.id;
        } else {
          const { data: newConv } = await supabase.from("conversaciones").insert({ cliente1_id: remitenteUuid, cliente2_id: vendedor.cliente_id, ultimo_mensaje: mensaje, fecha_ultimo_mensaje: new Date().toISOString() }).select().single();
          convId = newConv?.id;
        }
        await supabase.from("mensajes").insert({ conversacion_id: convId, remitente_id: remitenteUuid, contenido: mensaje, leido: false });
        await supabase.from("conversaciones").update({ ultimo_mensaje: mensaje, fecha_ultimo_mensaje: new Date().toISOString() }).eq("id", convId);
      } else {
        const { data: existingConv } = await supabase
          .from("conversaciones")
          .select("id")
          .eq("visitante_id", visitanteId)
          .eq("cliente2_id", vendedor.cliente_id)
          .maybeSingle();
        if (existingConv) {
          convId = existingConv.id;
        } else {
          const { data: newConv } = await supabase.from("conversaciones").insert({ visitante_id: visitanteId, visitante_nombre: visitanteNombre, cliente2_id: vendedor.cliente_id, ultimo_mensaje: mensaje, fecha_ultimo_mensaje: new Date().toISOString() }).select().single();
          convId = newConv?.id;
        }
        await supabase.from("mensajes").insert({ conversacion_id: convId, visitante_id: visitanteId, visitante_nombre: visitanteNombre, contenido: mensaje, leido: false });
        await supabase.from("conversaciones").update({ ultimo_mensaje: mensaje, fecha_ultimo_mensaje: new Date().toISOString() }).eq("id", convId);
      }

      setMensaje("");
      setMsgNombre("");
      setChatConvId(convId);
      setChatOpen(true);
      const { data: msgData } = await supabase.from("mensajes").select("*").eq("conversacion_id", convId).order("id", { ascending: true });
      setChatMensajes(msgData || []);
      setSnack({ open: true, msg: "Mensaje enviado al vendedor", severity: "success" });
    } catch (e) {
      console.error("Error enviando mensaje:", e);
      setSnack({ open: true, msg: "Error al enviar mensaje. ¿Ejecutaste los SQL de migración?", severity: "error" });
    } finally {
      setEnviandoMsg(false);
    }
  };

  const enviarChatMsg = async () => {
    if (!chatMsgInput.trim() || !chatConvId || !vendedor) return;
    const visitanteId = getVisitanteId();
    const visitanteNombre = msgNombre.trim() || "Visitante";
    try {
      if (authUser?.email) {
        const { data: cliente } = await supabase.from("clientes").select("id").eq("email", authUser.email).single();
        await supabase.from("mensajes").insert({ conversacion_id: chatConvId, remitente_id: cliente?.id, contenido: chatMsgInput, leido: false });
      } else {
        await supabase.from("mensajes").insert({ conversacion_id: chatConvId, visitante_id: visitanteId, visitante_nombre: visitanteNombre, contenido: chatMsgInput, leido: false });
      }
      await supabase.from("conversaciones").update({ ultimo_mensaje: chatMsgInput, fecha_ultimo_mensaje: new Date().toISOString() }).eq("id", chatConvId);
      setChatMsgInput("");
      const { data: msgData } = await supabase.from("mensajes").select("*").eq("conversacion_id", chatConvId).order("id", { ascending: true });
      setChatMensajes(msgData || []);
    } catch (e) {
      console.error("Error enviando mensaje:", e);
    }
  };

  const precioBase = producto?.precio ?? 0;

  const pesoTexto = (() => {
    if (!producto?.peso) return "";
    const m = producto.peso.match(/^(.+?)\s+(g|kg|unidades)$/);
    if (!m) return producto.peso;
    return m[2] === "kg" ? `${m[1]} kg` : m[2] === "unidades" ? `${m[1]} unid.` : `${m[1]}g`;
  })();

  const DEFAULT_GRAMOS = [32, 100, 200, 500, 1000];

  const preciosExtra = Array.isArray(producto?.precios) && producto.precios.length > 0
    ? producto.precios
    : DEFAULT_GRAMOS.map(g => ({ cantidad: g, unidad: "g", precio: Math.round((precioBase / 100) * g * 100) / 100 }));

  const precioSeleccionado = gramosSel ? preciosExtra.find((p: any) => p.cantidad === gramosSel) : null;
  const precioActual = precioSeleccionado?.precio ?? precioBase;

  const agregarAlCarrito = () => {
    if (!ctx) return;
    const prodMapeado = {
      id: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria_id,
      categoriaNombre: producto.categorias?.nombre,
      precio: producto.precio,
      precioAnterior: producto.precio_anterior,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      stock: producto.stock,
      etiquetas: Array.isArray(producto.etiquetas) ? producto.etiquetas : [],
      peso: producto.peso,
      origen: producto.origen,
      rating: producto.rating || 0,
      precios: preciosExtra,
    };
    ctx.addToCart(prodMapeado, gramosSel ?? undefined, precioActual);
    const label = gramosSel
      ? (() => { const u = precioSeleccionado?.unidad || "g"; return u === "kg" ? `${gramosSel} kg` : u === "unidades" ? `${gramosSel} unid.` : `${gramosSel}g`; })()
      : pesoTexto || "base";
    setSnack({ open: true, msg: `${producto.nombre} (${label}) agregado al carrito`, severity: "success" });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography sx={{ textAlign: "center", color: "#a0a0a0" }}>Cargando producto...</Typography>
      </Container>
    );
  }

  if (!producto) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ textAlign: "center", color: "#f44336" }}>Producto no encontrado</Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/catalogo")}>Volver al catálogo</Button>
        </Box>
      </Container>
    );
  }

  const etiquetas = Array.isArray(producto.etiquetas) ? producto.etiquetas : [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navigate("/")}>Inicio</Link>
        <Link underline="hover" sx={{ cursor: "pointer", color: "#a0a0a0" }} onClick={() => navigate("/catalogo")}>Catálogo</Link>
        <Typography color="primary">{producto.nombre}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Imagen */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <img src={producto.imagen} alt={producto.nombre} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
          </Box>
        </Grid>

        {/* Info */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{producto.nombre}</Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip label={producto.categorias?.nombre || "Sin categoría"} size="small" sx={{ background: "#8b6914", color: "#fff" }} />
            {producto.origen && <Chip label={`Origen: ${producto.origen}`} size="small" variant="outlined" sx={{ color: "#a0a0a0", borderColor: "#444" }} />}
            <Chip label={(() => { const m = (producto.peso || "").match(/^(.+?)\s+(g|kg|unidades)$/); return m ? `${m[1]}${m[2] === "kg" ? " kg" : m[2] === "unidades" ? " unid." : "g"}` : producto.peso || "Peso: N/A"})()} size="small" variant="outlined" sx={{ color: "#a0a0a0", borderColor: "#444" }} />
          </Box>

          {/* Rating Estrellas + Voto */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Rating value={producto.rating || 0} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ color: "#a0a0a0" }}>({producto.rating || 0})</Typography>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "#444" }} />
            <Typography variant="body2" sx={{ color: "#a0a0a0", mr: 1 }}>¿Te gusta?</Typography>
            <IconButton size="small" onClick={() => handleVoto("like")} sx={{ color: voto === "like" ? "#4caf50" : "#666" }}>
              <ThumbUp />
            </IconButton>
            <Typography variant="body2" sx={{ color: voto === "like" ? "#4caf50" : "#a0a0a0", fontFamily: "Roboto Mono" }}>{votosCount.like}</Typography>
            <IconButton size="small" onClick={() => handleVoto("dislike")} sx={{ color: voto === "dislike" ? "#f44336" : "#666" }}>
              <ThumbDown />
            </IconButton>
            <Typography variant="body2" sx={{ color: voto === "dislike" ? "#f44336" : "#a0a0a0", fontFamily: "Roboto Mono" }}>{votosCount.dislike}</Typography>
          </Box>

          <Typography variant="h3" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700, mb: 2 }}>
            S/ {Number(producto.precio).toFixed(2)}
            {producto.precio_anterior && (
              <Typography component="span" variant="h6" sx={{ textDecoration: "line-through", color: "#606060", ml: 1 }}>
                S/ {Number(producto.precio_anterior).toFixed(2)}
              </Typography>
            )}
          </Typography>

          {/* Presentación (gramos) */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Elige tu peso o cantidad</InputLabel>
              <Select label="Elige tu peso o cantidad" value={String(gramosSel ?? "")} onChange={e => setGramosSel(e.target.value === "" ? null : Number(e.target.value))}>
                <MenuItem value="">
                  <em>{pesoTexto ? `${pesoTexto} — S/ ${Number(precioBase).toFixed(2)}` : `Base — S/ ${Number(precioBase).toFixed(2)}`}</em>
                </MenuItem>
                {preciosExtra.sort((a: any, b: any) => a.cantidad - b.cantidad).map((p: any) => (
                  <MenuItem key={p.cantidad} value={String(p.cantidad)}>
                    {p.unidad === "kg" ? `${p.cantidad} kg` : p.unidad === "unidades" ? `${p.cantidad} unid.` : `${p.cantidad}g`}{p.unidad === "g" && p.cantidad < 1000 ? ` (${(p.cantidad / 1000).toFixed(3)} kg)` : ""} — S/ {Number(p.precio).toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Typography variant="body1" sx={{ color: "#c0c0c0", mb: 3 }}>{producto.descripcion || "Sin descripción"}</Typography>

          {/* Efectos (Etiquetas) */}
          {etiquetas.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#a0a0a0", mb: 1 }}>Efectos:</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {etiquetas.map((tag: string) => (
                  <Chip key={tag} label={tag} size="small" sx={{ background: "rgba(139,105,20,0.2)", color: "#8b6914", textTransform: "capitalize" }} />
                ))}
              </Box>
            </Box>
          )}

          {/* Cantidad y Carrito */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Cantidad:</Typography>
            <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #444", borderRadius: 2 }}>
              <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))}><Remove /></IconButton>
              <Typography sx={{ px: 2, fontFamily: "Roboto Mono" }}>{qty}</Typography>
              <IconButton size="small" onClick={() => setQty(q => Math.min(producto.stock, q + 1))}><Add /></IconButton>
            </Box>
            <Typography variant="caption" sx={{ color: producto.stock < 10 ? "#ff9800" : "#4caf50" }}>
              {producto.stock < 10 ? `Solo ${producto.stock} disponibles` : `${producto.stock} en stock`}
            </Typography>
          </Box>

          <Button variant="contained" size="large" fullWidth startIcon={<ShoppingCart />} onClick={agregarAlCarrito} sx={{ mb: 2 }}>
            Agregar al carrito — S/ {(precioActual * qty).toFixed(2)}
          </Button>

          {/* Info del Vendedor */}
          {vendedor && (
            <Paper sx={{ p: 2, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)", mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: "#a0a0a0", mb: 1 }}>Vendido por:</Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{vendedor.nombre_tienda}</Typography>
                  {vendedor.descripcion && <Typography variant="caption" sx={{ color: "#a0a0a0" }}>{vendedor.descripcion}</Typography>}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => navigate(`/tienda/${vendedor.id}`)} sx={{ borderColor: "#444", color: "#a0a0a0" }}>
                    Ver tienda
                  </Button>
                  <Button size="small" variant="contained" onClick={() => navigate(`/tienda/${vendedor.id}?contactar=1`)} sx={{ background: "#8b6914" }}>
                    Contactar al vendedor
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Relacionados */}
      {relacionados.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Productos relacionados</Typography>
          <Grid container spacing={2}>
            {relacionados.map(r => (
              <Grid key={r.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ cursor: "pointer" }} onClick={() => navigate(`/producto/${r.id}`)}>
                  <CardMedia component="img" height="160" image={r.imagen} sx={{ objectFit: "cover", aspectRatio: "4/3" }} />
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.nombre}</Typography>
                    <Typography variant="h6" sx={{ fontFamily: "Roboto Mono", color: "#8b6914" }}>S/ {Number(r.precio).toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Reseñas */}
      <Box ref={resenasRef} sx={{ mt: 8 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Reseñas del Producto</Typography>

        {/* Formulario de reseña - anónimo, sin registro */}
        <Paper sx={{ p: 3, mb: 4, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>Deja tu reseña</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#a0a0a0" }}>Calificación:</Typography>
            <Rating value={nuevaResena.calificacion} onChange={(_, v) => setNuevaResena(r => ({ ...r, calificacion: v || 5 }))} />
          </Box>
          <TextField
            fullWidth multiline rows={3}
            placeholder="Comparte tu experiencia con este producto..."
            value={nuevaResena.comentario}
            onChange={e => setNuevaResena(r => ({ ...r, comentario: e.target.value }))}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { background: "#111" } }}
          />
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button variant="outlined" component="label" startIcon={<ImageIcon />} sx={{ borderColor: "#444", color: "#a0a0a0" }}>
              {resenaImg ? "Cambiar imagen" : "Agregar imagen"}
              <input type="file" hidden accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setResenaImg(ev.target?.result as string || "");
                  reader.readAsDataURL(file);
                }
              }} />
            </Button>
            {resenaImg && (
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <img src={resenaImg} alt="Preview" style={{ height: 60, borderRadius: 4 }} />
                <IconButton size="small" onClick={() => setResenaImg("")} sx={{ position: "absolute", top: -8, right: -8, background: "#f44336", color: "#fff", width: 20, height: 20 }}>
                  <Delete />
                </IconButton>
              </Box>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={enviarResena} disabled={enviandoResena || !nuevaResena.comentario.trim()} sx={{ background: "#8b6914" }}>
              {enviandoResena ? "Enviando..." : "Enviar reseña"}
            </Button>
          </Box>
        </Paper>

        {resenas.length === 0 ? (
          <Typography sx={{ color: "#a0a0a0" }}>No hay reseñas aún. ¡Sé el primero en opinar!</Typography>
        ) : (
          resenas.map(r => (
            <Card key={r.id} sx={{ mb: 2, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.05)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14, background: "#8b6914" }}>
                      {(r.clientes?.nombre || r.nombre_cliente || "U")[0]}
                    </Avatar>
                    <Typography variant="subtitle2">{r.clientes?.nombre || r.nombre_cliente || "Anónimo"}</Typography>
                  </Box>
                  <Rating value={r.calificacion || 0} precision={0.5} size="small" readOnly />
                </Box>
                {r.comentario && <Typography variant="body2" sx={{ color: "#c0c0c0", mb: 1 }}>{r.comentario}</Typography>}
                {r.imagen_url && (
                  <img src={r.imagen_url} alt="Reseña" style={{ maxWidth: "100%", maxHeight: 250, borderRadius: 8, marginTop: 4 }} />
                )}
                {r.video_url && (
                  <Box sx={{ mt: 1 }}>
                    <video controls src={r.video_url} style={{ maxWidth: "100%", borderRadius: 8 }} />
                  </Box>
                )}
                <Typography variant="caption" sx={{ color: "#606060", display: "block", mt: 1 }}>
                  {new Date(r.created_at || r.fecha_creacion).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Mensaje al vendedor */}
      {vendedor && (
        <Box sx={{ mt: 4, mb: 8 }}>
          <Paper sx={{ p: 3, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Chat sx={{ color: "#8b6914" }} />
              <Typography variant="h6">Contactar a {vendedor.nombre_tienda}</Typography>
            </Box>
            {!authUser && (
              <TextField fullWidth size="small" label="Pon un nombre o apodo" value={msgNombre}
                onChange={e => setMsgNombre(e.target.value)} sx={{ mb: 2 }} />
            )}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth multiline rows={2}
                placeholder="Escribe tu mensaje..."
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { background: "#111" } }}
              />
              <Button
                variant="contained"
                endIcon={<Send />}
                onClick={enviarMensaje}
                disabled={enviandoMsg || !mensaje.trim()}
                sx={{ alignSelf: "flex-end", height: 40, background: "#8b6914" }}
              >
                {enviandoMsg ? "Enviando..." : "Enviar"}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}

function Remove(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M19 13H5v-2h14v2z" />
    </svg>
  );
}

function Add(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}