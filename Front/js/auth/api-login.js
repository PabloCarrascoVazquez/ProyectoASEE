const AuthAPI = {
    async login(email, password) {
        const data = await apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        SessionManager.saveSession(data);
        return data;
    },

    async register(userData) {
        return await apiRequest("/auth/register", {
            method: "POST",
            body: JSON.stringify(userData)
        });
    },

    async getProfile() {
        return await apiRequest("/auth/perfil", {
            method: "GET"
        });
    },

    async updateProfile(profileData) {
        return await apiRequest("/auth/perfil", {
            method: "PUT",
            body: JSON.stringify(profileData)
        });
    }
};