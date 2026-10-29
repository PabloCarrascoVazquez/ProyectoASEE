package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"orderservice/app"
	"orderservice/app/core"
	"orderservice/app/daos"
)

func main() {
	// 1. Cargar configuración centralizada (.env y entorno)
	cfg, err := core.LoadSettings()
	if err != nil {
		log.Fatalf("❌ Error crítico en configuración: %v", err)
	}

	// 2. Conectar e inicializar la base de datos (SQLite o MySQL)
	dbFactory := &daos.DatabaseConnectionFactory{}
	db, err := dbFactory.GetConnection(cfg)
	if err != nil {
		log.Fatalf("❌ Error conectando a la base de datos (%s): %v", cfg.DBEngine, err)
	}
	defer dbFactory.CloseConnection()

	// 3. Crear la aplicación ensamblando DAOs, Servicios y Rutas
	application := app.CreateApp(cfg, db)

	// 4. Contexto para apagado limpio (graceful shutdown)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 5. Iniciar consumidor asíncrono de RabbitMQ en background
	application.TicketConsumer.Start(ctx)

	// 6. Configurar servidor HTTP
	serverAddr := fmt.Sprintf(":%d", cfg.Port)
	server := &http.Server{
		Addr:         serverAddr,
		Handler:      application.Handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Canal para escuchar señales de terminación del sistema (Ctrl+C, SIGTERM)
	shutdownSignals := make(chan os.Signal, 1)
	signal.Notify(shutdownSignals, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 %s corriendo en http://0.0.0.0:%d (motor BD: %s)", cfg.ProjectName, cfg.Port, cfg.DBEngine)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("❌ Error fatal en servidor HTTP: %v", err)
		}
	}()

	// Esperar señal de apagado
	sig := <-shutdownSignals
	log.Printf("🛑 Señal recibida (%v). Iniciando apagado controlado del servicio...", sig)

	// Cancelar contexto de workers (consumidor de RabbitMQ)
	cancel()

	// Dar hasta 10 segundos al servidor HTTP para terminar peticiones activas
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("⚠️ Error durante el apagado forzado del servidor: %v", err)
	}

	log.Println("✅ OrderService detenido correctamente.")
}
