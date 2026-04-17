const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Request failed (${response.status})`);
  }
  return data;
}

export const apiClient = {
  baseUrl: API_BASE_URL,
  getMovies: () => request("/api/movies"),
  getShowtimesByMovie: (movieId) => request(`/api/movies/${movieId}/showtimes`),
  getSeatsByShowtime: (showtimeId) => request(`/api/showtimes/${showtimeId}/seats`),
  createBooking: ({ payload, idempotencyKey }) =>
    request("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(payload)
    }),
  createPayment: ({ payload, idempotencyKey }) =>
    request("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(payload)
    }),
  callbackPayment: (payload) =>
    request("/api/payments/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  getBookingTicket: (bookingId) => request(`/api/bookings/${bookingId}/ticket`)
};

export function createIdempotencyKey() {
  return crypto.randomUUID();
}
