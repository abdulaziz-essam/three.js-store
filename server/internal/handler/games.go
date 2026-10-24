package handler

import (
	"encoding/json"
	"net/http"

	"github.com/aek20/pixelvault-api/internal/model"
)

// seed data — mirrors the client games.ts
var games = []model.Game{
	{ID: "cyberpunk",   Title: "Cyberpunk 2077",            Genre: "RPG",        Price: 39.99, Rating: 4.2, Tag: "HOT",     Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "eldenring",   Title: "Elden Ring",                Genre: "Action RPG", Price: 59.99, Rating: 4.9, Tag: "GOTY",    Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "spiderman",   Title: "Spider-Man 2",              Genre: "Action",     Price: 69.99, Rating: 4.7, Tag: "NEW",     Platform: []string{"ps5"}},
	{ID: "tlou2",       Title: "The Last of Us II",         Genre: "Adventure",  Price: 49.99, Rating: 4.6, Tag: "SALE",    Platform: []string{"pc", "ps5"}},
	{ID: "witcher3",    Title: "The Witcher 3",             Genre: "RPG",        Price: 19.99, Rating: 4.8, Tag: "CLASSIC", Platform: []string{"pc", "ps5", "xbox", "nintendo"}},
	{ID: "gow",         Title: "God of War",                Genre: "Action",     Price: 49.99, Rating: 4.8, Tag: "EPIC",    Platform: []string{"pc", "ps5"}},
	{ID: "rdr2",        Title: "Red Dead Redemption 2",     Genre: "Open World", Price: 29.99, Rating: 4.9, Tag: "CLASSIC", Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "baldursgate", Title: "Baldur's Gate 3",           Genre: "RPG",        Price: 59.99, Rating: 5.0, Tag: "GOTY",    Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "sekiro",      Title: "Sekiro: Shadows Die Twice", Genre: "Action RPG", Price: 39.99, Rating: 4.8, Tag: "GOTY",    Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "batman",      Title: "Batman: Arkham Knight",     Genre: "Action",     Price: 19.99, Rating: 4.6, Tag: "EPIC",    Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "bioshock",    Title: "BioShock Infinite",         Genre: "FPS",        Price: 14.99, Rating: 4.7, Tag: "CLASSIC", Platform: []string{"pc", "ps5", "xbox"}},
	{ID: "kingdomhearts", Title: "Kingdom Hearts III",      Genre: "Action RPG", Price: 29.99, Rating: 4.5, Tag: "CLASSIC", Platform: []string{"pc", "ps5", "xbox"}},
}

func GetGames(w http.ResponseWriter, r *http.Request) {
	platform := r.URL.Query().Get("platform")
	genre    := r.URL.Query().Get("genre")

	result := make([]model.Game, 0, len(games))
	for _, g := range games {
		if platform != "" && !containsPlatform(g.Platform, platform) {
			continue
		}
		if genre != "" && g.Genre != genre {
			continue
		}
		result = append(result, g)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func GetGame(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	for _, g := range games {
		if g.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(g)
			return
		}
	}
	http.Error(w, `{"error":"game not found"}`, http.StatusNotFound)
}

func containsPlatform(platforms []string, target string) bool {
	for _, p := range platforms {
		if p == target {
			return true
		}
	}
	return false
}
