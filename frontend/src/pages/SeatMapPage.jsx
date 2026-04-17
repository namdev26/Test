import { EmptyState, Pill, SectionCard } from "../components";

export default function SeatMapPage({
  currentMovieTitle,
  showtimes,
  selectedShowtimeId,
  onSelectShowtime,
  seats,
  selectedSeatIds,
  onToggleSeat
}) {
  return (
    <>
      <SectionCard
        title="2) Showtimes"
        subtitle={
          currentMovieTitle
            ? `Lịch chiếu cho: ${currentMovieTitle}`
            : "Hãy chọn phim trước."
        }
      >
        <div className="showtime-grid">
          {showtimes.map((s) => (
            <button
              key={s.showtime_id}
              className={`showtime-item ${
                s.showtime_id === selectedShowtimeId ? "active" : ""
              }`}
              onClick={() => onSelectShowtime(s.showtime_id)}
            >
              <div>{s.theater_name}</div>
              <div>{s.room_name}</div>
              <Pill>{new Date(s.start_time).toLocaleString()}</Pill>
            </button>
          ))}
        </div>
        {showtimes.length === 0 ? <EmptyState text="Không có lịch chiếu." /> : null}
      </SectionCard>

      <SectionCard
        title="3) Seat Map"
        subtitle="Chọn một hoặc nhiều ghế AVAILABLE để giữ chỗ."
      >
        <div className="seat-map">
          {seats.map((seat) => {
            const active = selectedSeatIds.includes(seat.seat_id);
            return (
              <button
                key={seat.seat_id}
                disabled={seat.status !== "AVAILABLE"}
                className={`seat ${active ? "active" : ""}`}
                onClick={() => onToggleSeat(seat.seat_id)}
              >
                {seat.row}
                {seat.number}
              </button>
            );
          })}
        </div>
        {seats.length === 0 ? <EmptyState text="Chọn suất chiếu để tải sơ đồ ghế." /> : null}
      </SectionCard>
    </>
  );
}
