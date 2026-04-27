export const BASE_URL = "http://localhost:5000/api";
//const BASE_URL = "http://subsonic-festival.duckdns.org/api";

/**
 * Función base para realizar peticiones fetch inyectando el token de seguridad.
 */
export const fetchData = async (endpoint, options = {}) => {
    try {
        // 1. Intentamos obtener el token guardado tras el login
        const token = localStorage.getItem('subsonic_token');

        // 2. Configuramos los headers básicos
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // 3. Si el token existe, lo añadimos al header Authorization
        // Esto es lo que el decorador @token_required en Flask espera recibir
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: headers, // Usamos los headers con el token incluido
        });

        // 4. Manejo de errores de autenticación (Token expirado o inválido)
        if (response.status === 401 && !endpoint.includes('/auth/')) {
            console.warn("Sesión expirada o token inválido. Limpiando...");
            localStorage.removeItem('subsonic_token');
            // Opcional: window.location.href = '/login';
        }

        if (!response.ok) {
            // Intentamos parsear el error del backend
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || "Error en la petición");
        }

        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};