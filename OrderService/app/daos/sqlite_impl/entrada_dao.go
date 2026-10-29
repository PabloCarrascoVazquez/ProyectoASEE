package sqliteimpl

import (
	"database/sql"
	"fmt"
	"orderservice/app/models"
	"time"
)

type EntradaDAOSQLite struct {
	db *sql.DB
}

func NewEntradaDAOSQLite(db *sql.DB) *EntradaDAOSQLite {
	return &EntradaDAOSQLite{db: db}
}

func (dao *EntradaDAOSQLite) Create(entrada *models.Entrada) error {
	query := `
		INSERT INTO entradas (id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	var fechaUsoStr *string
	if entrada.FechaUso != nil {
		s := entrada.FechaUso.Format(time.RFC3339)
		fechaUsoStr = &s
	}

	_, err := dao.db.Exec(
		query,
		entrada.IDEntrada,
		entrada.IDFestival,
		entrada.UserID,
		string(entrada.Tipo),
		entrada.FechaCompra.Format(time.RFC3339),
		string(entrada.Estado),
		entrada.TransaccionID,
		fechaUsoStr,
	)
	if err != nil {
		return fmt.Errorf("error al insertar entrada en sqlite: %w", err)
	}
	return nil
}

func (dao *EntradaDAOSQLite) CreateBatch(entradas []*models.Entrada) error {
	if len(entradas) == 0 {
		return nil
	}
	tx, err := dao.db.Begin()
	if err != nil {
		return fmt.Errorf("error al iniciar transaccion sqlite: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO entradas (id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return fmt.Errorf("error al preparar insert batch: %w", err)
	}
	defer stmt.Close()

	for _, e := range entradas {
		var fechaUsoStr *string
		if e.FechaUso != nil {
			s := e.FechaUso.Format(time.RFC3339)
			fechaUsoStr = &s
		}
		_, err := stmt.Exec(
			e.IDEntrada,
			e.IDFestival,
			e.UserID,
			string(e.Tipo),
			e.FechaCompra.Format(time.RFC3339),
			string(e.Estado),
			e.TransaccionID,
			fechaUsoStr,
		)
		if err != nil {
			return fmt.Errorf("error al insertar item en batch: %w", err)
		}
	}

	return tx.Commit()
}

func (dao *EntradaDAOSQLite) GetByID(idEntrada string) (*models.Entrada, error) {
	query := `
		SELECT id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso
		FROM entradas
		WHERE id_entrada = ?
	`
	row := dao.db.QueryRow(query, idEntrada)

	var e models.Entrada
	var tipoStr, estadoStr, fechaCompraStr string
	var transaccionID, fechaUsoStr sql.NullString

	err := row.Scan(
		&e.IDEntrada,
		&e.IDFestival,
		&e.UserID,
		&tipoStr,
		&fechaCompraStr,
		&estadoStr,
		&transaccionID,
		&fechaUsoStr,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("error al consultar entrada por id: %w", err)
	}

	e.Tipo = models.TipoEntrada(tipoStr)
	e.Estado = models.EstadoEntrada(estadoStr)
	e.FechaCompra = parseTime(fechaCompraStr)
	if transaccionID.Valid {
		e.TransaccionID = transaccionID.String
	}
	if fechaUsoStr.Valid {
		t := parseTime(fechaUsoStr.String)
		e.FechaUso = &t
	}

	return &e, nil
}

func (dao *EntradaDAOSQLite) GetByUserID(userID string) ([]*models.Entrada, error) {
	query := `
		SELECT id_entrada, id_festival, user_id, tipo, fecha_compra, estado, transaccion_id, fecha_uso
		FROM entradas
		WHERE user_id = ?
		ORDER BY fecha_compra DESC
	`
	rows, err := dao.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error al consultar entradas por usuario: %w", err)
	}
	defer rows.Close()

	var lista []*models.Entrada
	for rows.Next() {
		var e models.Entrada
		var tipoStr, estadoStr, fechaCompraStr string
		var transaccionID, fechaUsoStr sql.NullString

		if err := rows.Scan(
			&e.IDEntrada,
			&e.IDFestival,
			&e.UserID,
			&tipoStr,
			&fechaCompraStr,
			&estadoStr,
			&transaccionID,
			&fechaUsoStr,
		); err != nil {
			return nil, fmt.Errorf("error al escanear fila de entrada: %w", err)
		}

		e.Tipo = models.TipoEntrada(tipoStr)
		e.Estado = models.EstadoEntrada(estadoStr)
		e.FechaCompra = parseTime(fechaCompraStr)
		if transaccionID.Valid {
			e.TransaccionID = transaccionID.String
		}
		if fechaUsoStr.Valid {
			t := parseTime(fechaUsoStr.String)
			e.FechaUso = &t
		}
		lista = append(lista, &e)
	}

	return lista, nil
}

func (dao *EntradaDAOSQLite) ExistsByTransactionID(transaccionID string) (bool, error) {
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

func (dao *EntradaDAOSQLite) MarcarComoUsada(idEntrada string, fechaUso time.Time) (bool, error) {
	query := `
		UPDATE entradas
		SET estado = ?, fecha_uso = ?
		WHERE id_entrada = ? AND estado = ?
	`
	res, err := dao.db.Exec(
		query,
		string(models.EstadoUsada),
		fechaUso.Format(time.RFC3339),
		idEntrada,
		string(models.EstadoValida),
	)
	if err != nil {
		return false, fmt.Errorf("error al marcar entrada como usada: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func (dao *EntradaDAOSQLite) ActualizarEstado(idEntrada string, nuevoEstado models.EstadoEntrada) (bool, error) {
	query := `UPDATE entradas SET estado = ? WHERE id_entrada = ?`
	res, err := dao.db.Exec(query, string(nuevoEstado), idEntrada)
	if err != nil {
		return false, fmt.Errorf("error al actualizar estado de entrada: %w", err)
	}
	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	return affected > 0, nil
}

func parseTime(val string) time.Time {
	formats := []string{
		time.RFC3339,
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, val); err == nil {
			return t
		}
	}
	return time.Now()
}
