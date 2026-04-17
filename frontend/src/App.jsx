import { useEffect, useMemo, useState } from "react";
import { apiClient, createIdempotencyKey } from "./api";
import { useCountdown } from "./hooks/useCountdown";
import ConcertListPage from "./pages/ConcertListPage";
import SeatMapPage from "./pages/SeatMapPage";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";

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
    phone: "0901234567"
  });

  const [card, setCard] = useState({
    card_number: "4111111111111111",
    card_expiry: "12/27",
    card_cvv: "123",
    card_holder: "NGUYEN VAN A"
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { mmss } = useCountdown(180, Boolean(booking) && !payment);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    setLoading(true);
    try {
      const res = await apiClient.getMovies();
      setMovies(res.data || []);
      setMessage("Loaded movies.");
    } catch (err) {
      setMessage(err.message);
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
    try {
      const res = await apiClient.getShowtimesByMovie(movieId);
      setShowtimes(res.data || []);
      setMessage("Loaded showtimes.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSeats(showtimeId) {
    setLoading(true);
    setSelectedShowtimeId(showtimeId);
    setSelectedSeatIds([]);
    try {
      const res = await apiClient.getSeatsByShowtime(showtimeId);
      setSeats(res.data || []);
      setMessage("Loaded seats.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createBooking() {
    if (!selectedShowtimeId || selectedSeatIds.length === 0) {
      setMessage("Select showtime and at least one seat.");
      return;
    }
    setLoading(true);
    setResultTicket(null);
    setPayment(null);
    try {
      const res = await apiClient.createBooking({
        idempotencyKey: createIdempotencyKey(),
        payload: {
          showtime_id: selectedShowtimeId,
          seat_ids: selectedSeatIds,
          customer
        }
      });
      setBooking(res.data);
      setMessage("Booking created. Proceed to payment.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function startPayment() {
    if (!booking) {
      setMessage("Create booking first.");
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.createPayment({
        idempotencyKey: createIdempotencyKey(),
        payload: {
          booking_id: booking.booking_id,
          amount: booking.total_amount,
          ...card
        }
      });
      setPayment(res.data);
      setMessage("Payment transaction created. Simulate gateway callback.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function callback(status) {
    if (!payment) {
      setMessage("Create payment first.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.callbackPayment({
          gateway_ref: payment.gateway_ref,
          status,
          booking_id: booking.booking_id
      });
      if (status === "SUCCESS") {
        const ticket = await apiClient.getBookingTicket(booking.booking_id);
        setResultTicket(ticket.data);
        setMessage("Payment success. Ticket issued.");
      } else {
        setResultTicket(null);
        setMessage("Payment failed. Seats released.");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentMovie = useMemo(
    () => movies.find((m) => m.id === selectedMovieId),
    [movies, selectedMovieId]
  );

  return (
    <div className="container">
      <h1>Movie Ticket Booking</h1>
      <p className="muted">API: {apiClient.baseUrl}</p>
      <p className="status">{loading ? "Loading..." : message}</p>

      <ConcertListPage
        movies={movies}
        selectedMovieId={selectedMovieId}
        onReload={loadMovies}
        onSelectMovie={loadShowtimes}
      />

      <SeatMapPage
        currentMovieTitle={currentMovie?.title}
        showtimes={showtimes}
        selectedShowtimeId={selectedShowtimeId}
        onSelectShowtime={loadSeats}
        seats={seats}
        selectedSeatIds={selectedSeatIds}
        onToggleSeat={(seatId) =>
          setSelectedSeatIds((prev) =>
            prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
          )
        }
      />

      <PaymentPage
        customer={customer}
        card={card}
        booking={booking}
        payment={payment}
        countdown={mmss}
        onCustomerChange={setCustomer}
        onCardChange={setCard}
        onCreateBooking={createBooking}
        onCreatePayment={startPayment}
        onCallback={callback}
      />

      <SuccessPage ticket={resultTicket} />
    </div>
  );
}
