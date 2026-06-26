import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "../lib/supabase.ts";
import {
  ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography,
  Button, TextField, InputAdornment, IconButton, Box, Container, Grid,
  Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Snackbar, Alert, Link as MuiLink
} from "@mui/material";
import {
  Search, Close, Add, Edit, Delete, NavigateBefore, NavigateNext,
  Save, Cancel, Category, Inventory, Refresh, Visibility, VisibilityOff,
  PersonAdd, Login as LoginIcon,
} from "@mui/icons-material";

const authTheme = createTheme({
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

interface AuthContextType {
  user: { email: string; nombre: string; rol: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; nombre: string; rol: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión activa desde localStorage
    (async () => {
      try {
        const sesionGuardada = localStorage.getItem("sesion_usuario");
        if (sesionGuardada) {
          const datos = JSON.parse(sesionGuardada);
          // Verificar que el usuario siga existiendo en la tabla clientes
          const { data: cliente } = await supabase.from("clientes").select("nombre, rol, activo").eq("email", datos.email).single();
          if (cliente && (cliente as { activo: boolean }).activo) {
            setUser({ email: datos.email, nombre: (cliente as { nombre: string }).nombre, rol: (cliente as { rol: string }).rol });
          } else {
            localStorage.removeItem("sesion_usuario");
          }
        }
      } catch {
        // No autenticado
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Función auxiliar para verificar password contra la tabla clientes
  const verificarPassword = async (email: string, password: string): Promise<{ nombre: string; rol: string } | null> => {
    console.log("Intentando login con:", email);
    const { data: cliente, error } = await supabase.from("clientes").select("nombre, rol, password_hash, salt, activo").eq("email", email).maybeSingle();
    console.log("Resultado cliente:", cliente, error);
    
    if (!cliente) {
      console.log("No se encontró cliente con email:", email);
      return null;
    }
    
    if (!(cliente as { activo: boolean }).activo) {
      console.log("Cliente inactivo");
      return null;
    }
    
    const passwordHash = cliente.password_hash as string;
    const salt = cliente.salt as string;
    
    // Verificar password: en demo usamos base64 del password
    const hashIngresado = btoa(password);
    console.log("Hash ingresado:", hashIngresado, "Hash almacenado:", passwordHash);
    if (hashIngresado !== passwordHash) {
      console.log("Passwords no coinciden");
      return null;
    }
    
    return { nombre: (cliente as { nombre: string }).nombre, rol: (cliente as { rol: string }).rol };
  };

  const login = async (email: string, password: string) => {
    // Buscar y verificar directamente en tabla clientes
    const datosCliente = await verificarPassword(email, password);
    if (!datosCliente) throw new Error("Credenciales inválidas");

    // Guardar sesión en localStorage
    const sesion = { email, nombre: datosCliente.nombre, rol: datosCliente.rol };
    localStorage.setItem("sesion_usuario", JSON.stringify(sesion));
    setUser(sesion);
  };

  const register = async (nombre: string, email: string, password: string) => {
    // Verificar que no exista
    const { data: existe } = await supabase.from("clientes").select("email").eq("email", email).single();
    if (existe) throw new Error("Este correo ya está registrado");

    // Crear registro directo en tabla clientes
    const passwordHash = btoa(password); // Base64 para demo
    const salt = btoa(email); // Base64 para demo
    const rol = "usuario"; // Todos se registran como usuario normal

    const { error: insertError } = await supabase.from("clientes").insert({
      nombre,
      email,
      password_hash: passwordHash,
      salt,
      rol,
      activo: true,
    });

    if (insertError) throw insertError;

    // Iniciar sesión automáticamente
    const sesion = { email, nombre, rol };
    localStorage.setItem("sesion_usuario", JSON.stringify(sesion));
    setUser(sesion);
  };

  const logout = async () => {
    localStorage.removeItem("sesion_usuario");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.rol === "admin", login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function AuthPage({ onBack }: { onBack: () => void }) {
  const [modo, setModo] = useState<"login" | "register">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        if (!nombre.trim()) throw new Error("El nombre es requerido");
        await register(nombre, email, password);
      }
      onBack();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error en autenticación");
    } finally {
      setCargando(false);
    }
  };

  return (
    <ThemeProvider theme={authTheme}>
      <CssBaseline />
      {/* Header Admin */}
      <AppBar position="sticky" sx={{ background: "rgba(15,26,15,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Inventory sx={{ color: "#8b6914", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontFamily: "Montserrat", fontWeight: 800, color: "#e8e8e8" }}>
            {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </Typography>
          </Box>
          <Button variant="outlined" size="small" onClick={onBack} sx={{ color: "#e8e8e8", borderColor: "#444" }}>
            Volver
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            {modo === "login" ? "Bienvenido de nuevo" : "Crear cuenta de usuario"}
          </Typography>
          <Typography variant="body1" sx={{ color: "#a0a0a0" }}>
            {modo === "login" ? "Ingresa tus credenciales para continuar" : "Regístrate para acceder a tu cuenta"}
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {modo === "register" && (
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  sx={{ mb: 2 }}
                  required
                  autoFocus
                />
              )}

              <TextField
                fullWidth
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mb: 2 }}
                required
                autoFocus={modo === "login"}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LoginIcon sx={{ color: "#8b6914" }} /></InputAdornment>,
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><VisibilityOff sx={{ color: "#8b6914" }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#a0a0a0" }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={cargando}
                sx={{ mb: 2 }}
              >
                {cargando ? "Procesando..." : modo === "login" ? "Iniciar Sesión" : "Registrarse"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                {modo === "login" ? (
                  <Typography variant="body2" sx={{ color: "#a0a0a0" }}>
                    ¿No tienes cuenta?{" "}
                    <MuiLink
                      component="button"
                      type="button"
                      sx={{ color: "#8b6914", cursor: "pointer", fontWeight: 600 }}
                      onClick={() => { setModo("register"); setError(""); }}
                    >
                      Regístrate aquí
                    </MuiLink>
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: "#a0a0a0" }}>
                    ¿Ya tienes cuenta?{" "}
                    <MuiLink
                      component="button"
                      type="button"
                      sx={{ color: "#8b6914", cursor: "pointer", fontWeight: 600 }}
                      onClick={() => { setModo("login"); setError(""); }}
                    >
                      Inicia sesión
                    </MuiLink>
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Nota informativa */}
        <Box sx={{ mt: 4, p: 3, background: "rgba(139,105,20,0.1)", border: "1px solid rgba(139,105,20,0.3)", borderRadius: 2 }}>
          <Typography variant="body2" sx={{ color: "#a0a0a0", textAlign: "center" }}>
            <strong style={{ color: "#8b6914" }}>Nota:</strong> Regístrate como usuario normal. 
            El acceso de administrador se otorga de forma separada.
          </Typography>
        </Box>
      </Container>

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" variant="filled" onClose={() => setError("")}>{error}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}