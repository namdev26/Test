import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { apiClient, createIdempotencyKey } from "./api";
import { useCountdown } from "./hooks/useCountdown";
import MovieListPage from "./pages/ConcertListPage";
import ShowtimeSeatPage from "./pages/SeatMapPage";
import BookingPaymentPage from "./pages/PaymentPage";
import TicketResultPage from "./pages/SuccessPage";

const STEPS = [
  { label: "Chọn phim" },
  { label: "Suất chiếu & Ghế" },
  { label: "Đặt vé & Thanh toán" },
  { label: "Hoàn tất" },
];

function getStep(state) {
  if (state.resultTicket) return 3;
  if (state.booking) return 2;
  if (state.selectedMovieId) return 1;
  return 0;
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);

  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [resultTicket, setResultTicket] = useState(null);

  const [customer, setCustomer] = useState({
    name: "Nguyen Van A",
    email: "a@gmail.com",
    phone: "0901234567",
  });

  const [card, setCard] = useState({
    card_number: "4111111111111111",
    card_expiry: "12/27",
    card_cvv: "123",
    card_holder: "NGUYEN VAN A",
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Sẵn sàng.");
  const [isError, setIsError] = useState(false);
  const { mmss } = useCountdown(180, Boolean(booking) && !payment);

  const currentStep = getStep({ resultTicket, booking, selectedMovieId });

  useEffect(() => {
    loadMovies();
  }, []);

  function setStatus(msg, error = false) {
    setStatusMsg(msg);
    setIsError(error);
  }

  async function loadMovies() {
    setLoading(true);
    setStatus("Đang tải danh sách phim...");
    try {
      const res = await apiClient.getMovies();
      setMovies(res.data || []);
      setStatus("Sẵn sàng.");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function loadShowtimes(movieId) {
    setLoading(true);
    setSelectedMovieId(movieId);
    setSelectedShowtimeId(null);
    setSelectedSeatIds([]);
    setSeats([]);
    setBooking(null);
    setPayment(null);
    setResultTicket(null);
    setStatus("Đang tải lịch chiếu...");
    try {
      const res = await apiClient.getShowtimesByMovie(movieId);
      setShowtimes(res.data || []);
      setStatus("Đã tải lịch chiếu.");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function loadSeats(showtimeId) {
    setLoading(true);
    setSelectedShowtimeId(showtimeId);
    setSelectedSeatIds([]);
    setStatus("Đang tải sơ đồ ghế...");
    try {
      const res = await apiClient.getSeatsByShowtime(showtimeId);
      setSeats(res.data || []);
      setStatus("Đã tải sơ đồ ghế.");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function createBooking() {
    if (!selectedShowtimeId || selectedSeatIds.length === 0) {
      setStatus("Vui lòng chọn suất chiếu và ít nhất 1 ghế.", true);
      return;
    }
    setLoading(true);
    setResultTicket(null);
    setPayment(null);
    setStatus("Đang tạo booking và giữ ghế...");
    try {
      const res = await apiClient.createBooking({
        idempotencyKey: createIdempotencyKey(),
        payload: {
          showtime_id: selectedShowtimeId,
          seat_ids: selectedSeatIds,
          customer,
        },
      });
      // Java returns camelCase: bookingId, totalAmount — normalize to snake_case for downstream use
      const raw = res.data;
      const normalized = {
        ...raw,
        booking_id: raw.bookingId ?? raw.booking_id,
        total_amount: raw.totalAmount ?? raw.total_amount,
        seat_ids: raw.seatIds ?? raw.seat_ids,
        showtime_id: raw.showtimeId ?? raw.showtime_id,
      };
      setBooking(normalized);
      setStatus("Booking tạo thành công. Ghế đang được giữ — vui lòng thanh toán.");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function startPayment() {
    if (!booking) {
      setStatus("Vui lòng tạo booking trước.", true);
      return;
    }
    setLoading(true);
    setStatus("Đang tạo giao dịch thanh toán...");
    try {
      const res = await apiClient.createPayment({
        idempotencyKey: createIdempotencyKey(),
        payload: {
          booking_id: booking.booking_id,
          amount: booking.total_amount,
          card_number: card.card_number,
          card_expiry: card.card_expiry,
          card_cvv: card.card_cvv,
          card_holder: card.card_holder,
        },
      });
      // normalize payment fields
      const p = res.data;
      setPayment({
        ...p,
        gateway_ref: p.gatewayRef ?? p.gateway_ref,
        payment_id: p.paymentId ?? p.payment_id,
      });
      setStatus("Giao dịch đã tạo. Vui lòng xác nhận thanh toán.");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCallback(status) {
    if (!payment) {
      setStatus("Chưa có giao dịch.", true);
      return;
    }
    setLoading(true);
    setStatus(status === "SUCCESS" ? "Đang xác nhận thanh toán..." : "Đang hủy giao dịch...");
    try {
      await apiClient.callbackPayment({
        gateway_ref: payment.gateway_ref,
        status,
        booking_id: booking.booking_id,
      });
      if (status === "SUCCESS") {
        const ticket = await apiClient.getBookingTicket(booking.booking_id);
        setResultTicket(ticket.data);
        setStatus("🎉 Thanh toán thành công! Vé đã được xuất.");
      } else {
        setResultTicket(null);
        setBooking(null);
        setPayment(null);
        setSeats((prev) =>
          prev.map((s) => {
            const sId = s.seatId ?? s.seat_id;
            return selectedSeatIds.includes(sId) ? { ...s, status: "AVAILABLE" } : s;
          })
        );
        setStatus("Thanh toán thất bại. Ghế đã được giải phóng.", true);
      }
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  }

  const currentMovie = useMemo(
    () => movies.find((m) => m.id === selectedMovieId),
    [movies, selectedMovieId]
  );

  // Java returns camelCase: showtimeId; legacy snake_case: showtime_id
  const selectedShowtime = useMemo(
    () => showtimes.find((s) => (s.showtimeId ?? s.showtime_id) === selectedShowtimeId),
    [showtimes, selectedShowtimeId]
  );

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">🎬</div>
          <div className="navbar-name">Cine<span>Book</span></div>
        </div>
        <div className={`navbar-status ${loading ? 'loading' : isError ? 'error' : ''}`}>
          {loading ? '⏳ ' : isError ? '⚠ ' : '✓ '}{statusMsg}
        </div>
      </nav>

      {/* Stepper */}
      <div className="stepper-bar">
        <div className="stepper">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`step ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`}
            >
              <div className="step-num">
                {i < currentStep ? '✓' : i + 1}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="main-content">
        {/* Step 1: Movies */}
        <MovieListPage
          movies={movies}
          selectedMovieId={selectedMovieId}
          onReload={loadMovies}
          onSelectMovie={loadShowtimes}
        />

        {/* Steps 2 & 3: Showtimes + Seat map */}
        {selectedMovieId && (
          <ShowtimeSeatPage
            currentMovieTitle={currentMovie?.title}
            showtimes={showtimes}
            selectedShowtimeId={selectedShowtimeId}
            onSelectShowtime={loadSeats}
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={(seatId) =>
              setSelectedSeatIds((prev) =>
                prev.includes(seatId)
                  ? prev.filter((id) => id !== seatId)
                  : [...prev, seatId]
              )
            }
            selectedShowtime={selectedShowtime}
          />
        )}

        {/* Steps 4 & 5: Booking + Payment */}
        {selectedShowtimeId && (
          <BookingPaymentPage
            customer={customer}
            card={card}
            booking={booking}
            payment={payment}
            countdown={mmss}
            onCustomerChange={setCustomer}
            onCardChange={setCard}
            onCreateBooking={createBooking}
            onCreatePayment={startPayment}
            onCallback={handleCallback}
            selectedSeatIds={selectedSeatIds}
            selectedShowtime={selectedShowtime}
            currentMovieTitle={currentMovie?.title}
          />
        )}

        {/* Step 6: Ticket */}
        {resultTicket && (
          <TicketResultPage ticket={resultTicket} booking={booking} />
        )}
      </main>
    </div>
  );
}
