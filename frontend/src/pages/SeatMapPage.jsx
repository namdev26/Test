import { EmptyState, SectionCard } from "../components";

function formatTime(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  if (isNaN(d)) return '--:--';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso) {
  if (!iso) return 'Ngày không hợp lệ';
  const d = new Date(iso);
  if (isNaN(d)) return 'Ngày không hợp lệ';
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

// Java Spring Boot returns camelCase by default — map both variants
function getField(obj, camel, snake) {
  return obj[camel] !== undefined ? obj[camel] : obj[snake];
}

function getShowtimeId(s)   { return getField(s, 'showtimeId',   'showtime_id'); }
function getTheaterName(s)  { return getField(s, 'theaterName',  'theater_name'); }
function getRoomName(s)     { return getField(s, 'roomName',     'room_name'); }
function getStartTime(s)    { return getField(s, 'startTime',    'start_time'); }
function getSeatId(seat)    { return getField(seat, 'seatId',    'seat_id'); }

export default function ShowtimeSeatPage({
  currentMovieTitle,
  showtimes,
  selectedShowtimeId,
  onSelectShowtime,
  seats,
  selectedSeatIds,
  onToggleSeat,
  selectedShowtime,
}) {
  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.row || seat.Row || 'A';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  const price = selectedShowtime?.price ?? selectedShowtime?.pricePerSeat ?? 95000;
  const totalPrice = selectedSeatIds.length * price;
  const theaterName = selectedShowtime ? getTheaterName(selectedShowtime) : '';

  return (
    <>
      {/* ---- SHOWTIMES ---- */}
      <SectionCard
        badge="Bước 2"
        title="Chọn suất chiếu"
        subtitle={
          currentMovieTitle
            ? `Lịch chiếu của: ${currentMovieTitle}`
            : 'Hãy chọn phim trước.'
        }
      >
        {showtimes.length === 0 ? (
          <EmptyState icon="🗓" text="Không có lịch chiếu. Hãy chọn phim để tải lịch." />
        ) : (
          <div className="showtime-grid">
            {showtimes.map((s) => {
              const sid       = getShowtimeId(s);
              const theater   = getTheaterName(s);
              const room      = getRoomName(s);
              const startTime = getStartTime(s);
              return (
                <button
                  key={sid}
                  className={`showtime-card ${selectedShowtimeId === sid ? 'selected' : ''}`}
                  onClick={() => onSelectShowtime(sid)}
                >
                  <div className="showtime-theater">🎦 {theater}</div>
                  <div className="showtime-room">{room}</div>
                  <div className="showtime-time">{formatTime(startTime)}</div>
                  <div className="showtime-date">{formatDate(startTime)}</div>
                  <div className="showtime-price">{formatPrice(s.price)} / ghế</div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ---- SEAT MAP ---- */}
      <SectionCard
        badge="Bước 3"
        title="Chọn ghế"
        subtitle="Chọn một hoặc nhiều ghế trống để đặt chỗ."
      >
        {seats.length === 0 ? (
          <EmptyState icon="🪑" text="Chọn suất chiếu để hiển thị sơ đồ ghế." />
        ) : (
          <>
            {/* Screen */}
            <div className="screen-label">
              <div className="screen-bar" />
              <div className="screen-text">MÀN HÌNH</div>
            </div>

            {/* Legend */}
            <div className="seat-legend">
              <div className="legend-item"><div className="legend-dot available" /><span>Trống</span></div>
              <div className="legend-item"><div className="legend-dot selected" /><span>Đang chọn</span></div>
              <div className="legend-item"><div className="legend-dot held" /><span>Đang giữ</span></div>
              <div className="legend-item"><div className="legend-dot sold" /><span>Đã bán</span></div>
            </div>

            {/* Seat rows */}
            <div className="seat-rows">
              {Object.entries(seatsByRow)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([row, rowSeats]) => (
                  <div key={row} className="seat-row">
                    <div className="seat-row-label">{row}</div>
                    {rowSeats
                      .sort((a, b) => (a.number || 0) - (b.number || 0))
                      .map((seat) => {
                        const sId = getSeatId(seat);
                        const isSelected = selectedSeatIds.includes(sId);
                        const isHeld = seat.status === 'HELD';
                        const isSold = seat.status === 'SOLD';
                        return (
                          <button
                            key={sId}
                            className={`seat-btn ${isSelected ? 'selected' : ''} ${isHeld ? 'held' : ''} ${isSold ? 'sold' : ''}`}
                            disabled={seat.status !== 'AVAILABLE'}
                            onClick={() => onToggleSeat(sId)}
                            title={`Ghế ${seat.row}${seat.number} - ${seat.status}`}
                          >
                            {seat.number}
                          </button>
                        );
                      })}
                  </div>
                ))}
            </div>

            {/* Summary bar */}
            {selectedSeatIds.length > 0 && (
              <div className="seat-summary-bar">
                <div className="seat-summary-text">
                  Đã chọn <strong>{selectedSeatIds.length} ghế</strong>
                  {theaterName && <> tại <strong>{theaterName}</strong></>}
                </div>
                <div className="seat-summary-total">
                  {formatPrice(totalPrice)}
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </>
  );
}
