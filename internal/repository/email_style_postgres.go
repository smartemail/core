package repository

import (
	"database/sql"

	"github.com/Notifuse/notifuse/internal/domain"
)

type emailStyleRepository struct {
	systemDB *sql.DB
}

func NewEmailStyleRepository(systemDB *sql.DB) domain.EmailStyleRepository {
	return &emailStyleRepository{
		systemDB: systemDB,
	}
}

func (r *emailStyleRepository) GetEmailStyles() ([]*domain.EmailStyle, error) {
	query := `SELECT id, name, code, description FROM email_styles`
	rows, err := r.systemDB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var emailStyles []*domain.EmailStyle
	for rows.Next() {
		var emailStyle domain.EmailStyle
		err := rows.Scan(&emailStyle.ID, &emailStyle.Name, &emailStyle.Code, &emailStyle.Description)
		if err != nil {
			return nil, err
		}
		emailStyles = append(emailStyles, &emailStyle)
	}
	return emailStyles, nil
}

func (r *emailStyleRepository) GetEmailStyleByCode(code string) (*domain.EmailStyle, error) {
	query := `SELECT id, name, code, description FROM email_styles WHERE code = $1`
	row := r.systemDB.QueryRow(query, code)
	var emailStyle domain.EmailStyle
	err := row.Scan(&emailStyle.ID, &emailStyle.Name, &emailStyle.Code, &emailStyle.Description)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &emailStyle, nil
}
