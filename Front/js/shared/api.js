/**
 * Cliente HTTP centralizado para conectar con el API Gateway de Subsonic.
 */
const API_GATEWAY = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? "http://localhost:8000"
  : window.location.origin;

async function apiRequest(endpoint, options = {}) {
    const token = SessionManager.getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_GATEWAY}${endpoint}`, config);
        
        // Si el token ha expirado o no es válido (401), cerramos sesión automáticamente
        if (response.status === 401 && !endpoint.includes("/auth/login")) {
            console.warn("Sesión caducada o no autorizada.");
            SessionManager.clearSession();
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                codigo: data.codigo || response.status,
                mensaje: data.mensaje || "Error en la petición",
                detalle: data.detalle || data.message || "Ocurrió un error inesperado."
            };
        }

        return data;
    } catch (error) {
        console.error(`Error en API [${endpoint}]:`, error);
        throw error;
    }
}