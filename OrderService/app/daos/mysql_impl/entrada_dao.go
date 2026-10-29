package mysqlimpl

import (
	"database/sql"
	"fmt"
	"orderservice/app/models"
	"time"
)

type EntradaDAOMySQL struct {
	db *sql.DB
}

func NewEntradaDAOMySQL(db *sql.DB) *EntradaDAOMySQL {
	return &EntradaDAOMySQL{db: db}
}

func (dao *EntradaDAOMySQL) Create(entrada *models.Entrada) error {
	query := `
		INSERT INTO entradas (id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := dao.db.Exec(
		query,
		entrada.IDEntrada,
		entrada.IDFestival,
		entrada.UserID,
		string(entrada.Tipo),
		entrada.FechaCompra,
		string(entrada.Estado),
		entrada.TransaccionID,
		entrada.FechaUso,
	)
	if err != nil {
		return fmt.Errorf("error al insertar entrada en mysql: %w", err)
	}
	return nil
}

func (dao *EntradaDAOMySQL) CreateBatch(entradas []*models.Entrada) error {
	if len(entradas) == 0 {
		return nil
	}
	tx, err := dao.db.Begin()
	if err != nil {
		return fmt.Errorf("error al iniciar transaccion mysql: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO entradas (id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return fmt.Errorf("error al preparar insert batch mysql: %w", err)
	}
	defer stmt.Close()

	for _, e := range entradas {
		_, err := stmt.Exec(
			e.IDEntrada,
			e.IDFestival,
			e.UserID,
			string(e.Tipo),
			e.FechaCompra,
			string(e.Estado),
			e.TransaccionID,
			e.FechaUso,
		)
		if err != nil {
			return fmt.Errorf("error al insertar item en batch mysql: %w", err)
		}
	}

	return tx.Commit()
}

func (dao *EntradaDAOMySQL) GetByID(idEntrada string) (*models.Entrada, error) {
	query := `
		SELECT id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso
		FROM entradas
		WHERE id_entrada = ?
	`
	row := dao.db.QueryRow(query, idEntrada)

	var e models.Entrada
	var tipoStr, estadoStr string
	var transaccionID sql.NullString
	var fechaUso sql.NullTime

	err := row.Scan(
		&e.IDEntrada,
		&e.IDFestival,
		&e.UserID,
		&tipoStr,
		&e.FechaCompra,
		&estadoStr,
		&transaccionID,
		&fechaUso,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error al consultar entrada por id en mysql: %w", err)
	}

	e.Tipo = models.TipoEntrada(tipoStr)
	e.Estado = models.EstadoEntrada(estadoStr)
	if transaccionID.Valid {
		e.TransaccionID = transaccionID.String
	}
	if fechaUso.Valid {
		e.FechaUso = &fechaUso.Time
	}

	return &e, nil
}

func (dao *EntradaDAOMySQL) GetByUserID(userID string) ([]*models.Entrada, error) {
	query := `
		SELECT id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso
		FROM entradas
		WHERE user_id = ?
		ORDER BY fecha_compra DESC
	`
	rows, err := dao.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error al consultar entradas por usuario en mysql: %w", err)
	}
	defer rows.Close()

	var lista []*models.Entrada
	for rows.Next() {
		var e models.Entrada
		var tipoStr, estadoStr string
		var transaccionID sql.NullString
		var fechaUso sql.NullTime

		if err := rows.Scan(
			&e.IDEntrada,
			&e.IDFestival,
			&e.UserID,
			&tipoStr,
			&e.FechaCompra,
			&estadoStr,
			&transaccionID,
			&fechaUso,
		); err != nil {
			return nil, fmt.Errorf("error al escanear fila de entrada en mysql: %w", err)
		}

		e.Tipo = models.TipoEntrada(tipoStr)
		e.Estado = models.EstadoEntrada(estadoStr)
		if transaccionID.Valid {
			e.TransaccionID = transaccionID.String
		}
		if fechaUso.Valid {
			e.FechaUso = &fechaUso.Time
		}
		lista = append(lista, &e)
	}

	return lista, nil
}

func (dao *EntradaDAOMySQL) ExistsByTransactionID(transaccionID string) (bool, error) {
	query := `SELECT 1 FROM entradas WHERE transaccion_id = ? LIMIT 1`
	var dummy int
	err := dao.db.QueryRow(query, transaccionID).Scan(&dummy)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (dao *EntradaDAOMySQL) MarcarComoUsada(idEntrada string, fechaUso time.Time) (bool, error) {
	query := `
		UPDATE entradas
		SET estado = ?, fecha_uso = ?
		WHERE id_entrada = ? AND estado = ?
	`
	res, err := dao.db.Exec(
		query,
		string(models.EstadoUsada),
		fechaUso,
		idEntrada,
		string(models.EstadoValida),
	)
	if err != nil {
		return false, fmt.Errorf("error al marcar entrada como usada en mysql: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func (dao *EntradaDAOMySQL) ActualizarEstado(idEntrada string, nuevoEstado models.EstadoEntrada) (bool, error) {
	query := `UPDATE entradas SET estado = ? WHERE id_entrada = ?`
	res, err := dao.db.Exec(query, string(nuevoEstado), idEntrada)
	if err != nil {
		return false, fmt.Errorf("error al actualizar estado de entrada en mysql: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}
