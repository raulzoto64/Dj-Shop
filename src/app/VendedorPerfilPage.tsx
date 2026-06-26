import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase.ts";
import { useAuth } from "./LoginPage.tsx";
import {
  Container, Typography, Box, Grid, Button, Card, CardMedia, CardContent,
  Chip, Snackbar, Alert, Avatar, Rating, TextField, Paper,
} from "@mui/material";
import {
  ArrowBack, Store, LocationOn, Phone, Star, Inventory, Chat, Send,
} from "@mui/icons-material";

export default function VendedorPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const [vendedor, setVendedor] = useState<any>(null);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [msgNombre, setMsgNombre] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "info" }>({ open: false, msg: "", severity: "info" });

  const contactarActivo = searchParams.get("contactar") === "1";

  const getVisitanteId = () => {
    let vid = localStorage.getItem("visitante_id");
    if (!vid) {
      vid = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem("visitante_id", vid);
    }
    return vid;
  };

  useEffect(() => {
    if (!id) return;
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const { data: vendedorData } = await supabase.from("vendedores").select("*").eq("id", id).single();
      if (!vendedorData) return;
      setVendedor(vendedorData);

      const { data: prodData } = await supabase.from("productos").select("*, categorias(*)").eq("usuario_id", vendedorData.cliente_id);
      setProductos(prodData || []);
    } catch (e) {
      console.error("Error cargando tienda:", e);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim() || !vendedor) return;
    setEnviando(true);
    try {
      const visitanteId = getVisitanteId();
      const visitanteNombre = msgNombre.trim() || "Visitante";

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
        let convId: string;
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
        let convId: string;
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
      setSnack({ open: true, msg: "Mensaje enviado al vendedor", severity: "success" });
    } catch (e) {
      console.error("Error enviando mensaje:", e);
      setSnack({ open: true, msg: "Error al enviar mensaje. ¿Ejecutaste los SQL de migración?", severity: "error" });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography sx={{ textAlign: "center", color: "#a0a0a0" }}>Cargando tienda...</Typography>
      </Container>
    );
  }

  if (!vendedor) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ textAlign: "center", color: "#f44336" }}>Tienda no encontrada</Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/catalogo")}>Volver</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ color: "#a0a0a0", mb: 3 }}>Volver</Button>

      {/* Header Tienda */}
      <Card sx={{ mb: 4, background: "linear-gradient(135deg, #1a2a1a 0%, #1e2e1e 100%)" }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3, p: 4 }}>
          <Avatar sx={{ width: 80, height: 80, background: "#8b6914" }}>
            <Store sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{vendedor.nombre_tienda}</Typography>
            {vendedor.descripcion && (
              <Typography variant="body1" sx={{ color: "#c0c0c0", mb: 2 }}>{vendedor.descripcion}</Typography>
            )}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {vendedor.ubicacion && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16, color: "#8b6914" }} />
                  <Typography variant="body2" sx={{ color: "#a0a0a0" }}>{vendedor.ubicacion}</Typography>
                </Box>
              )}
              {vendedor.telefono && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Phone sx={{ fontSize: 16, color: "#8b6914" }} />
                  <Typography variant="body2" sx={{ color: "#a0a0a0" }}>{vendedor.telefono}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Inventory sx={{ fontSize: 16, color: "#8b6914" }} />
                <Typography variant="body2" sx={{ color: "#a0a0a0" }}>{productos.length} productos</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Contactar al vendedor */}
      {contactarActivo && (
        <Paper sx={{ p: 3, mb: 4, background: "#1a2a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
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
              fullWidth multiline rows={3}
              placeholder="Escribe tu mensaje..."
              value={mensaje}
              onChange={e => setMensaje(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { background: "#111" } }}
            />
            <Button
              variant="contained"
              endIcon={<Send />}
              onClick={enviarMensaje}
              disabled={enviando || !mensaje.trim()}
              sx={{ alignSelf: "flex-end", height: 40 }}
            >
              {enviando ? "Enviando..." : "Enviar"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Productos */}
      <Typography variant="h5" sx={{ mb: 3 }}>Productos</Typography>
      {productos.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Inventory sx={{ fontSize: 60, color: "#333", mb: 2 }} />
          <Typography sx={{ color: "#a0a0a0" }}>Esta tienda no tiene productos aún</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {productos.map(p => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ cursor: "pointer", height: "100%" }} onClick={() => navigate(`/producto/${p.id}`)}>
                <CardMedia component="img" height="180" image={p.imagen} sx={{ objectFit: "cover", aspectRatio: "4/3" }} />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{p.nombre}</Typography>
                  <Rating value={p.rating || 0} precision={0.1} size="small" readOnly sx={{ mb: 1 }} />
                  <Typography variant="h6" sx={{ fontFamily: "Roboto Mono", color: "#8b6914", fontWeight: 700 }}>
                    S/ {Number(p.precio).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
}
