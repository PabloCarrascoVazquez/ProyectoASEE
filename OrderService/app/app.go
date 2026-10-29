package app

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"orderservice/app/core"
	"orderservice/app/daos"
	"orderservice/app/middleware"
	"orderservice/app/routes"
	"orderservice/app/services"
)

// Application encapsula el handler HTTP del servidor y los workers de fondo.
type Application struct {
	Handler        http.Handler
	TicketConsumer *services.TicketConsumer
	OrderService   *services.OrderService
	QRService      *services.QRService
	DAOFactory     *daos.DAOFactory
}

// CreateApp inicializa y ensambla todas las dependencias del microservicio (equivalente a create_app() en UserService).
func CreateApp(cfg *core.Settings, db *sql.DB) *Application {
	daoFactory := daos.NewDAOFactory(db, cfg.DBEngine)
	entradaDAO := daoFactory.GetEntradaDAO()
	cancelacionDAO := daoFactory.GetCancelacionDAO()

	orderService := services.NewOrderService(entradaDAO, cancelacionDAO)
	qrService := services.NewQRService(entradaDAO, cfg)
	ticketConsumer := services.NewTicketConsumer(entradaDAO, cfg)

	authMiddleware := middleware.NewAuthMiddleware(cfg)
	orderRoutes := routes.NewOrderRoutes(orderService, qrService, authMiddleware, cfg.StaffRoles)

	mux := http.NewServeMux()

	// Health Check en la raíz (idéntico a UserService)
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"service": cfg.ProjectName,
			"version": cfg.Version,
			"status":  "running",
		})
	})

	// Registro de rutas del microservicio
	orderRoutes.RegisterRoutes(mux)

	// Envolver con middleware de CORS
	corsHandler := authMiddleware.CORS(mux)

	return &Application{
		Handler:        corsHandler,
		TicketConsumer: ticketConsumer,
		OrderService:   orderService,
		QRService:      qrService,
		DAOFactory:     daoFactory,
	}
}
