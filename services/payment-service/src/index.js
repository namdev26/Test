const express = require("express");

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://ticket-booking-service:5000";
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5000";

const payments = [];
const idempotencyStore = new Map();
let paymentSeed = 500;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/payments", (req, res) => {
  const key = req.header("Idempotency-Key");
  if (!key) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Idempotency-Key is required" } });
  }
  if (idempotencyStore.has(key)) {
    return res.status(201).json(idempotencyStore.get(key));
  }

  const { booking_id, amount, card_number, card_expiry, card_cvv, card_holder } = req.body;
  if (!booking_id || !amount || !card_number || !card_expiry || !card_cvv || !card_holder) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid payment request" } });
  }

  const payment = {
    payment_id: ++paymentSeed,
    booking_id,
    amount,
    status: "PENDING",
    gateway_ref: `GW-${Date.now()}`
  };
  payments.push(payment);
  const payload = { data: payment };
  idempotencyStore.set(key, payload);
  return res.status(201).json(payload);
});

app.get("/payments/:id", (req, res) => {
  const id = Number(req.params.id);
  const payment = payments.find((p) => p.payment_id === id);
  if (!payment) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Payment not found" } });
  }
  return res.json({ data: payment });
});

app.post("/payments/callback", async (req, res) => {
  const { gateway_ref, status, booking_id } = req.body;
  const payment = payments.find((p) => p.gateway_ref === gateway_ref || p.booking_id === booking_id);
  if (!payment) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Payment not found" } });
  }
  if (!status || !["SUCCESS", "FAILED"].includes(status)) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "status must be SUCCESS or FAILED" } });
  }

  payment.status = status;
  if (status === "SUCCESS") {
    const ticketRes = await fetch(`${BOOKING_SERVICE_URL}/internal/bookings/${payment.booking_id}/confirm`, { method: "POST" });
    const ticketPayload = ticketRes.ok ? await ticketRes.json() : null;
    if (ticketPayload && ticketPayload.data) {
      await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "customer@example.com",
          subject: "Xac nhan dat ve thanh cong",
          template: "booking-success",
          data: { booking_id: payment.booking_id, ticket_code: ticketPayload.data.ticket_code }
        })
      });
    }
  } else {
    await fetch(`${BOOKING_SERVICE_URL}/internal/bookings/${payment.booking_id}/fail`, { method: "POST" });
    await fetch(`${NOTIFICATION_SERVICE_URL}/notifications/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "customer@example.com",
        subject: "Thong bao thanh toan that bai",
        template: "booking-failed",
        data: { booking_id: payment.booking_id }
      })
    });
  }

  return res.json({ data: { payment_id: payment.payment_id, status: payment.status } });
});

app.listen(port, () => {
  console.log(`payment-service listening on ${port}`);
});
