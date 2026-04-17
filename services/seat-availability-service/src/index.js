const express = require("express");

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const seatState = {
  3001: Array.from({ length: 20 }).map((_, index) => ({
    seat_id: index + 1,
    row: String.fromCharCode(65 + Math.floor(index / 10)),
    number: (index % 10) + 1,
    status: "AVAILABLE",
    booking_id: null
  }))
};

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/showtimes/:showtimeId/seats", (req, res) => {
  const showtimeId = Number(req.params.showtimeId);
  const seats = seatState[showtimeId];
  if (!seats) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Showtime not found" } });
  }
  return res.json({ data: seats.map(({ seat_id, row, number, status }) => ({ seat_id, row, number, status })) });
});

app.post("/showtimes/:showtimeId/seats/:seatId/hold", (req, res) => {
  const showtimeId = Number(req.params.showtimeId);
  const seatId = Number(req.params.seatId);
  const { booking_id } = req.body;
  const seats = seatState[showtimeId];
  if (!seats) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Showtime not found" } });
  }
  const seat = seats.find((s) => s.seat_id === seatId);
  if (!seat) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Seat not found" } });
  }
  if (!booking_id) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "booking_id is required" } });
  }
  if (seat.status !== "AVAILABLE") {
    return res.status(409).json({ error: { code: "SEAT_UNAVAILABLE", message: "Seat is not available" } });
  }
  seat.status = "HELD";
  seat.booking_id = booking_id;
  return res.json({ data: { showtime_id: showtimeId, seat_id: seatId, status: "HELD" } });
});

app.post("/showtimes/:showtimeId/seats/:seatId/release", (req, res) => {
  const showtimeId = Number(req.params.showtimeId);
  const seatId = Number(req.params.seatId);
  const seats = seatState[showtimeId];
  if (!seats) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Showtime not found" } });
  }
  const seat = seats.find((s) => s.seat_id === seatId);
  if (!seat) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Seat not found" } });
  }
  seat.status = "AVAILABLE";
  seat.booking_id = null;
  return res.json({ data: { showtime_id: showtimeId, seat_id: seatId, status: "AVAILABLE" } });
});

app.post("/showtimes/:showtimeId/seats/:seatId/sold", (req, res) => {
  const showtimeId = Number(req.params.showtimeId);
  const seatId = Number(req.params.seatId);
  const seats = seatState[showtimeId];
  if (!seats) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Showtime not found" } });
  }
  const seat = seats.find((s) => s.seat_id === seatId);
  if (!seat) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Seat not found" } });
  }
  seat.status = "SOLD";
  return res.json({ data: { showtime_id: showtimeId, seat_id: seatId, status: "SOLD" } });
});

app.listen(port, () => {
  console.log(`seat-availability-service listening on ${port}`);
});
