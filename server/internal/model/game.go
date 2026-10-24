package model

type Game struct {
	ID       string   `json:"id"`
	Title    string   `json:"title"`
	Genre    string   `json:"genre"`
	Price    float64  `json:"price"`
	Rating   float64  `json:"rating"`
	Cover    string   `json:"cover"`
	Tag      string   `json:"tag,omitempty"`
	Platform []string `json:"platform"`
}
