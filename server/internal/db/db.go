package db

import (
	"context"
	"database/sql"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func Connect() *sql.DB {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	db, err := sql.Open("pgx", url)
	if err != nil {
		log.Fatal("failed to open db:", err)
	}
	if err := db.PingContext(context.Background()); err != nil {
		log.Fatal("failed to connect to db:", err)
	}

	log.Println("connected to database")
	return db
}
