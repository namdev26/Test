const express = require("express");

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const CUSTOMER_SERVICE_URL = process.env.CUSTOMER_SERVICE_URL || "http://customer-service:5000";
const SEAT_SERVICE_URL = process.env.SEAT_SERVICE_URL || "http://seat-availability-service:5000";

const bookings = [];
const idempotencyStore = new Map();
let bookingSeed = 200;
let ticketSeed = 400;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/bookings", async (req, res) => {
  const idempotencyKey = req.header("Idempotency-Key");
  if (!idempotencyKey) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Idempotency-Key header is required" } });
  }
  if (idempotencyStore.has(idempotencyKey)) {
    return res.status(201).json(idempotencyStore.get(idempotencyKey));
  }

  const { showtime_id, seat_ids, customer } = req.body;
  if (!showtime_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0 || !customer) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid booking request" } });
  }

  let customerInfo;
  try {
    const existing = await fetch(`${CUSTOMER_SERVICE_URL}/customers/by-email?email=${encodeURIComponent(customer.email)}`);
    if (existing.status === 200) {
      customerInfo = (await existing.json()).data;
    } else {
      const created = await fetch(`${CUSTOMER_SERVICE_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer)
      });
      if (!created.ok) {
        return res.status(400).json({ error: { code: "CUSTOMER_ERROR", message: "Unable to resolve customer" } });
      }
      customerInfo = (await created.json()).data;
    }
  } catch (_error) {
    return res.status(500).json({ error: { code: "UPSTREAM_ERROR", message: "Customer service unavailable" } });
  }

  const bookingId = ++bookingSeed;
  for (const seatId of seat_ids) {
    try {
      const holdRes = await fetch(`${SEAT_SERVICE_URL}/showtimes/${showtime_id}/seats/${seatId}/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, ttl_seconds: 180 })
      });
      if (!holdRes.ok) {
        return res.status(409).json({ error: { code: "SEAT_UNAVAILABLE", message: `Seat ${seatId} is not available` } });
      }
    } catch (_error) {
      return res.status(500).json({ error: { code: "UPSTREAM_ERROR", message: "Seat service unavailable" } });
    }
  }

  const total_amount = seat_ids.length * 95000;
  const booking = {
    booking_id: bookingId,
    showtime_id,
    seat_ids,
    customer_id: customerInfo.id,
    status: "PENDING_PAYMENT",
    total_amount
  };
  bookings.push(booking);
  const payload = { data: booking };
  idempotencyStore.set(idempotencyKey, payload);
  return res.status(201).json(payload);
});

app.get("/bookings/:id", (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find((b) => b.booking_id === id);
  if (!booking) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Booking not found" } });
  }
  return res.json({ data: booking });
});

app.post("/bookings/:id/cancel", async (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find((b) => b.booking_id === id);
  if (!booking) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Booking not found" } });
  }
  if (booking.status === "CONFIRMED") {
    return res.status(409).json({ error: { code: "INVALID_STATE", message: "Confirmed booking cannot be cancelled" } });
  }
  booking.status = "CANCELLED";
  for (const seatId of booking.seat_ids) {
    await fetch(`${SEAT_SERVICE_URL}/showtimes/${booking.showtime_id}/seats/${seatId}/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: booking.booking_id })
    });
  }
  return res.json({ data: booking });
});

app.get("/bookings/:id/ticket", (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find((b) => b.booking_id === id);
  if (!booking || booking.status !== "CONFIRMED" || !booking.ticket) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ticket not found" } });
  }
  return res.json({ data: booking.ticket });
});

app.post("/internal/bookings/:id/confirm", async (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find((b) => b.booking_id === id);
  if (!booking) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Booking not found" } });
  }
  booking.status = "CONFIRMED";
  for (const seatId of booking.seat_ids) {
    await fetch(`${SEAT_SERVICE_URL}/showtimes/${booking.showtime_id}/seats/${seatId}/sold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: booking.booking_id })
    });
  }
  booking.ticket = {
    ticket_id: ++ticketSeed,
    booking_id: booking.booking_id,
    ticket_code: `MOV-${new Date().getFullYear()}-${booking.booking_id}`,
    qr_data: `https://tickets.example.com/verify/MOV-${new Date().getFullYear()}-${booking.booking_id}`
  };
  return res.json({ data: booking.ticket });
});

app.post("/internal/bookings/:id/fail", async (req, res) => {
  const id = Number(req.params.id);
  const booking = bookings.find((b) => b.booking_id === id);
  if (!booking) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Booking not found" } });
  }
  booking.status = "FAILED";
  for (const seatId of booking.seat_ids) {
    await fetch(`${SEAT_SERVICE_URL}/showtimes/${booking.showtime_id}/seats/${seatId}/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: booking.booking_id })
    });
  }
  return res.json({ data: booking });
});

app.listen(port, () => {
  console.log(`ticket-booking-service listening on ${port}`);
});
