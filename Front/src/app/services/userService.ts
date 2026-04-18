import { UserAPI } from '../api/user_api';

// Interfaces para coherencia con el Backend
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: 'user' | 'admin' | 'vendor' | null;
}

export interface AuthResponse {
    token: string;
    user: UserProfile;
}

export const userService = {
    /**
     * Registra un nuevo usuario en el sistema.
     */
    register: async (name: string, email: string, password: string): Promise<string> => {
        try {
            const response = await UserAPI.register(name, email, password);
            // El backend devuelve { "message": "...", "user_id": "..." }
            return response.user_id;
        } catch (error) {
            console.error("Error en el registro de usuario:", error);
            throw error;
        }
    },

    /**
     * Autentica al usuario y retorna el token y sus datos básicos.
     */
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await UserAPI.login(email, password);
            // Guardamos el token en localStorage para que fetchData lo use
            if (response.token) {
                localStorage.setItem('subsonic_token', response.token);
            }
            return response;
        } catch (error) {
            console.error("Error en el inicio de sesión:", error);
            throw error;
        }
    },

    /**
     * Cierra la sesión limpiando el almacenamiento.
     */
    logout: () => {
        localStorage.removeItem('subsonic_token');
        // También podrías limpiar estados de contextos aquí
    }
};