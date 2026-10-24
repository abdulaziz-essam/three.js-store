package main

import (
	"log"
	"net/http"

	"github.com/aek20/pixelvault-api/internal/handler"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health",    handler.Health)
	mux.HandleFunc("GET /games",     handler.GetGames)
	mux.HandleFunc("GET /games/{id}", handler.GetGame)

	log.Println("server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
