package sqliteimpl

import (
	"database/sql"
	"fmt"
	"orderservice/app/models"
	"time"
)

type CancelacionDAOSQLite struct {
	db *sql.DB
}

func NewCancelacionDAOSQLite(db *sql.DB) *CancelacionDAOSQLite {
	return &CancelacionDAOSQLite{db: db}
}

func (dao *CancelacionDAOSQLite) Create(c *models.Cancelacion) error {
	query := `
		INSERT INTO cancelaciones (id_cancelacion, id_entrada, user_id, estado_devolucion, fecha_solicitud, motivo)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	_, err := dao.db.Exec(
		query,
		c.IDCancelacion,
		c.IDEntrada,
		c.UserID,
		c.EstadoDevolucion,
		c.FechaSolicitud.Format(time.RFC3339),
		c.Motivo,
	)
	if err != nil {
		return fmt.Errorf("error al insertar cancelacion en sqlite: %w", err)
	}
	return nil
}

func (dao *CancelacionDAOSQLite) GetByEntradaID(idEntrada string) (*models.Cancelacion, error) {
	query := `
		SELECT id_cancelacion, id_entrada, user_id, estado_devolucion, fecha_solicitud, motivo
		FROM cancelaciones
		WHERE id_entrada = ?
		LIMIT 1
	`
	row := dao.db.QueryRow(query, idEntrada)

	var c models.Cancelacion
	var fechaSolicitudStr string
	var motivo sql.NullString

	err := row.Scan(
		&c.IDCancelacion,
		&c.IDEntrada,
		&c.UserID,
		&c.EstadoDevolucion,
		&fechaSolicitudStr,
		&motivo,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error al consultar cancelacion por entrada: %w", err)
	}

	c.FechaSolicitud = parseTime(fechaSolicitudStr)
	if motivo.Valid {
		c.Motivo = motivo.String
	}
	return &c, nil
}

func (dao *CancelacionDAOSQLite) GetByUserID(userID string) ([]*models.Cancelacion, error) {
	query := `
		SELECT id_cancelacion, id_entrada, user_id, estado_devolucion, fecha_solicitud, motivo
		FROM cancelaciones
		WHERE user_id = ?
		ORDER BY fecha_solicitud DESC
	`
	rows, err := dao.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error al consultar cancelaciones por usuario: %w", err)
	}
	defer rows.Close()

	var lista []*models.Cancelacion
	for rows.Next() {
		var c models.Cancelacion
		var fechaSolicitudStr string
		var motivo sql.NullString

		if err := rows.Scan(
			&c.IDCancelacion,
			&c.IDEntrada,
			&c.UserID,
			&c.EstadoDevolucion,
			&fechaSolicitudStr,
			&motivo,
		); err != nil {
			return nil, fmt.Errorf("error al escanear fila de cancelacion: %w", err)
		}

		c.FechaSolicitud = parseTime(fechaSolicitudStr)
		if motivo.Valid {
			c.Motivo = motivo.String
		}
		lista = append(lista, &c)
	}
	return lista, nil
}
