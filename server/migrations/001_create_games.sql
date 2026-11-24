CREATE TABLE IF NOT EXISTS games (
    id       TEXT PRIMARY KEY,
    title    TEXT NOT NULL,
    genre    TEXT NOT NULL,
    price    NUMERIC(10,2) NOT NULL,
    rating   NUMERIC(3,1) NOT NULL,
    tag      TEXT NOT NULL,
    platform TEXT[] NOT NULL
);
