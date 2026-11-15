document.addEventListener("DOMContentLoaded", () => {
    // 1. Si el usuario ya tiene sesión activa, redirigir directamente
    if (SessionManager.isAuthenticated()) {
        redirigirSegunRol();
        return;
    }

    // Referencias a elementos del DOM
    const btnTabLogin = document.getElementById("btn-tab-login");
    const btnTabRegister = document.getElementById("btn-tab-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const msgBox = document.getElementById("auth-message-box");
    const msgText = document.getElementById("auth-message-text");

    // ==========================================
    // 2. ALTERNAR ENTRE PESTAÑAS LOGIN / REGISTRO
    // ==========================================
    btnTabLogin.addEventListener("click", () => {
        ocultarMensaje();
        btnTabLogin.classList.add("active");
        btnTabRegister.classList.remove("active");
        formLogin.hidden = false;
        formRegister.hidden = true;
    });

    btnTabRegister.addEventListener("click", () => {
        ocultarMensaje();
        btnTabRegister.classList.add("active");
        btnTabLogin.classList.remove("active");
        formRegister.hidden = false;
        formLogin.hidden = true;
    });

    // ==========================================
    // 3. MANEJO DEL FORMULARIO DE LOGIN
    // ==========================================
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarMensaje();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;

        try {
            await AuthAPI.login(email, password);
            mostrarMensaje("¡Acceso correcto! Redirigiendo...", false);
            setTimeout(() => redirigirSegunRol(), 600);
        } catch (err) {
            mostrarMensaje(err.detalle || "Credenciales incorrectas.", true);
        }
    });

    // ==========================================
    // 4. MANEJO DEL FORMULARIO DE REGISTRO
    // ==========================================
    formRegister.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarMensaje();

        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;
        const avatar = document.getElementById("reg-avatar").value.trim();
        const rol = document.getElementById("reg-rol").value;

        // Construir objeto según UserRegisterRequest
        const userData = {
            name,
            email,
            password,
            rol,
            ...(avatar ? { avatar } : {})
        };

        try {
            await AuthAPI.register(userData);
            mostrarMensaje("Cuenta creada con éxito. Ya puedes iniciar sesión.", false);
            formRegister.reset();
            
            // Cambiar automáticamente a la pestaña de login rellenando el email
            btnTabLogin.click();
            document.getElementById("login-email").value = email;
        } catch (err) {
            mostrarMensaje(err.detalle || "No se pudo completar el registro.", true);
        }
    });

    // ==========================================
    // FUNCIONES AUXILIARES DE INTERFAZ
    // ==========================================
    function redirigirSegunRol() {
        if (SessionManager.isAdmin()) {
            window.location.href = "./admin.html";
        } else {
            window.location.href = "./index.html";
        }
    }

    function mostrarMensaje(texto, esError = true) {
        msgText.textContent = texto;
        msgBox.className = esError ? "alert-box error-box" : "alert-box success-box";
        msgBox.hidden = false;
    }

    function ocultarMensaje() {
        msgBox.hidden = true;
        msgText.textContent = "";
    }
});