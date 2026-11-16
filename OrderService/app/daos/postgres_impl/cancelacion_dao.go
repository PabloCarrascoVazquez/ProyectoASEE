package postgresimpl

import (
	"database/sql"
	"fmt"
	"orderservice/app/models"
)

type CancelacionDAOPostgres struct {
	db *sql.DB
}

func NewCancelacionDAOPostgres(db *sql.DB) *CancelacionDAOPostgres {
	return &CancelacionDAOPostgres{db: db}
}

func (dao *CancelacionDAOPostgres) Create(c *models.Cancelacion) error {
	query := `
		INSERT INTO cancelaciones (id_cancelacion, id_entrada, user_id, estado_devolucion, fecha_solicitud, motivo)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := dao.db.Exec(
		query,
		c.IDCancelacion,
		c.IDEntrada,
		c.UserID,
		c.EstadoDevolucion,
		c.FechaSolicitud,
		c.Motivo,
	)
	if err != nil {
		return fmt.Errorf("error al insertar cancelacion en postgres: %w", err)
	}
	return nil
}

func (dao *CancelacionDAOPostgres) GetByEntradaID(idEntrada string) (*models.Cancelacion, error) {
	query := `
		SELECT id_cancelacion, id_entrada, user_id, estado_devolucion, fecha_solicitud, motivo
		FROM cancelaciones
		WHERE id_entrada = $1
		LIMIT 1
	`
	row := dao.db.QueryRow(query, idEntrada)

	var c models.Cancelacion
	var motivo sql.NullString

	err := row.Scan(
		&c.IDCancelacion,
		&c.IDEntrada,
		&c.UserID,
		&c.EstadoDevolucion,
		&c.FechaSolicitud,
		&motivo,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error al consultar cancelacion por entrada en postgres: %w", err)
	}

	if motivo.Valid {
		c.Motivo = motivo.String
	}
	return &c, nil
}

func (dao *CancelacionDAOPostgres) GetByUserID(userID string) ([]*models.Cancelacion, error) {
	query := `
		SELECT id_cancelacion, id_entrada, user_id, estado_devolucion, fecha_solicitud, motivo
		FROM cancelaciones
		WHERE user_id = $1
		ORDER BY fecha_solicitud DESC
	`
	rows, err := dao.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error al consultar cancelaciones por usuario en postgres: %w", err)
	}
	defer rows.Close()

	var lista []*models.Cancelacion
	for rows.Next() {
		var c models.Cancelacion
		var motivo sql.NullString

		if err := rows.Scan(
			&c.IDCancelacion,
			&c.IDEntrada,
			&c.UserID,
			&c.EstadoDevolucion,
			&c.FechaSolicitud,
			&motivo,
		); err != nil {
			return nil, fmt.Errorf("error al escanear fila de cancelacion en postgres: %w", err)
		}

		if motivo.Valid {
			c.Motivo = motivo.String
		}
		lista = append(lista, &c)
	}
	return lista, nil
}
