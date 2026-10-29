package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"orderservice/app/core"
	"orderservice/app/dtos"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey   contextKey = "current_user_id"
	UserRoleKey contextKey = "current_user_role"
)

// AuthMiddleware encapsula la autenticación basada en JWT y el control de acceso por roles.
type AuthMiddleware struct {
	settings *core.Settings
}

func NewAuthMiddleware(settings *core.Settings) *AuthMiddleware {
	return &AuthMiddleware{settings: settings}
}

// TokenRequired valida que exista un JWT válido en Authorization: Bearer <token>
func (m *AuthMiddleware) TokenRequired(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			m.respondError(w, http.StatusUnauthorized, "Acceso no autorizado", "Falta el token Bearer en la cabecera.")
			return
		}

		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(m.settings.SecretKey), nil
		})

		if err != nil || !token.Valid {
			m.respondError(w, http.StatusUnauthorized, "Acceso no autorizado", "Token inválido o expirado.")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			m.respondError(w, http.StatusUnauthorized, "Acceso no autorizado", "Claims de token no válidos.")
			return
		}

		userID := ""
		if sub, ok := claims["sub"].(string); ok && sub != "" {
			userID = sub
		} else if uid, ok := claims["user_id"].(string); ok && uid != "" {
			userID = uid
		}

		if userID == "" {
			m.respondError(w, http.StatusUnauthorized, "Acceso no autorizado", "El token no contiene un identificador de usuario válido.")
			return
		}

		role := "client"
		if r, ok := claims["role"].(string); ok && r != "" {
			role = r
		} else if r, ok := claims["rol"].(string); ok && r != "" {
			role = r
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserRoleKey, role)
		next(w, r.WithContext(ctx))
	}
}

// RoleRequired asegura que el usuario posea uno de los roles permitidos
func (m *AuthMiddleware) RoleRequired(allowedRoles []string, next http.HandlerFunc) http.HandlerFunc {
	return m.TokenRequired(func(w http.ResponseWriter, r *http.Request) {
		role, _ := r.Context().Value(UserRoleKey).(string)

		permitido := false
		for _, rPerm := range allowedRoles {
			if strings.EqualFold(role, rPerm) {
				permitido = true
				break
			}
		}

		if !permitido {
			m.respondError(w, http.StatusForbidden, "Acceso denegado", "No tienes permisos suficientes para realizar esta acción.")
			return
		}

		next(w, r)
	})
}

// CORS envuelve el handler para gestionar las cabeceras Cross-Origin de manera compatible con Vite/React
func (m *AuthMiddleware) CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		allowedOrigin := "*"
		if origin != "" {
			for _, o := range m.settings.CORSOrigins {
				if o == "*" || o == origin {
					allowedOrigin = origin
					break
				}
			}
		}

		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (m *AuthMiddleware) respondError(w http.ResponseWriter, code int, mensaje, detalle string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(dtos.ErrorResponse{
		Codigo:  code,
		Mensaje: mensaje,
		Detalle: detalle,
	})
}

// GetCurrentUserID extrae el ID de usuario del contexto de la petición
func GetCurrentUserID(r *http.Request) string {
	if val, ok := r.Context().Value(UserIDKey).(string); ok {
		return val
	}
	return ""
}

// GetCurrentUserRole extrae el rol de usuario del contexto de la petición
func GetCurrentUserRole(r *http.Request) string {
	if val, ok := r.Context().Value(UserRoleKey).(string); ok {
		return val
	}
	return "client"
}
