const express = require("express");

const app = express();
const port = process.env.PORT || 5000;

const movies = [
  { id: 1, title: "Avengers: Endgame", duration_minutes: 181, rating: "T13", status: "NOW_SHOWING" },
  { id: 2, title: "Interstellar", duration_minutes: 169, rating: "T13", status: "COMING_SOON" }
];

const showtimes = [
  { showtime_id: 3001, movie_id: 1, theater_name: "CGV Vincom", room_name: "Room 05", start_time: "2026-04-18T09:30:00Z", price: 95000 },
  { showtime_id: 3002, movie_id: 1, theater_name: "Lotte NowZone", room_name: "Hall 02", start_time: "2026-04-18T13:30:00Z", price: 110000 },
  { showtime_id: 4001, movie_id: 2, theater_name: "CGV Landmark", room_name: "Room 08", start_time: "2026-04-19T10:30:00Z", price: 120000 }
];

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/movies", (req, res) => {
  const { status } = req.query;
  const data = status ? movies.filter((m) => m.status === status) : movies;
  res.json({ data });
});

app.get("/movies/:id", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((m) => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Movie not found" } });
  }
  return res.json({ data: movie });
});

app.get("/movies/:id/showtimes", (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find((m) => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Movie not found" } });
  }
  return res.json({ data: showtimes.filter((s) => s.movie_id === id) });
});

app.listen(port, () => {
  console.log(`movie-service listening on ${port}`);
});
