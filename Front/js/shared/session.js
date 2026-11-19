/**
 * Gestión centralizada de la sesión del usuario y tokens JWT.
 */
const SessionManager = {
    // Guarda el token y datos del usuario según su rol
    saveSession(data) {
        const token = data.access_token;
        const user = data.user;

        if (!token || !user) return;

        // Guardamos el token genérico
        localStorage.setItem("jwtToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Si es administrador, guardamos también el token específico de admin
        if (user.rol === "admin") {
            localStorage.setItem("adminToken", token);
        }
    },

    // Obtiene el token activo (prioriza el de admin si existe o el genérico)
    getToken() {
        return localStorage.getItem("adminToken") || localStorage.getItem("jwtToken");
    },

    // Obtiene el objeto completo del usuario almacenado
    getUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },

    // Comprueba si hay una sesión activa
    isAuthenticated() {
        return !!this.getToken();
    },

    // Comprueba si el usuario actual es administrador
    isAdmin() {
        const user = this.getUser();
        return user && user.rol === "admin";
    },

    // Comprueba si el usuario actual es proveedor
    isSupplier() {
        const user = this.getUser();
        return user && (user.rol === "supplier" || user.rol === "proveedor");
    },

    // Cierra la sesión limpiando todo el almacenamiento local
    clearSession() {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("user");
        window.location.href = "/login.html";
    }
};