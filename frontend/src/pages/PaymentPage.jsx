import { SectionCard } from "../components";

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

function formatTime(iso) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  if (isNaN(d)) return '--:--';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

// helper to read both camelCase and snake_case
function f(obj, camel, snake) {
  return obj?.[camel] !== undefined ? obj[camel] : obj?.[snake];
}

export default function BookingPaymentPage({
  customer,
  card,
  booking,
  payment,
  countdown,
  onCustomerChange,
  onCardChange,
  onCreateBooking,
  onCreatePayment,
  onCallback,
  selectedSeatIds,
  selectedShowtime,
  currentMovieTitle,
}) {
  return (
    <>
      {/* ---- STEP 4: Booking ---- */}
      <SectionCard
        badge="Bước 4"
        title="Thông tin đặt vé"
        subtitle="Điền thông tin người đặt để tạo booking và giữ ghế."
      >
        <div className="booking-layout">
          {/* Left: form */}
          <div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  className="form-input"
                  value={customer.name}
                  onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={customer.email}
                  onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  className="form-input"
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
                  placeholder="090xxxxxxx"
                />
              </div>
            </div>

            <div className="btn-row">
              <button
                className="btn btn-primary btn-lg"
                onClick={onCreateBooking}
                disabled={selectedSeatIds.length === 0}
              >
                🎟 Đặt vé ngay
              </button>
              {booking && (
                <div className="timer-pill">
                  <div className="timer-dot" />
                  Giữ chỗ: {countdown}
                </div>
              )}
            </div>

            {booking && (
              <div className="payment-status-box pending" style={{ marginTop: 16 }}>
                <div className="payment-status-icon">⏳</div>
                <div className="payment-status-text">
                  <div className="payment-status-label">Booking #{booking.booking_id} — PENDING PAYMENT</div>
                  <div className="payment-status-sub">Ghế đang được giữ. Vui lòng thanh toán trước khi hết giờ.</div>
                </div>
              </div>
            )}
          </div>

          {/* Right: summary */}
          <div className="booking-summary-card">
            <div className="booking-summary-title">📋 Tóm tắt đơn hàng</div>
            <div className="booking-summary-row">
              <span className="booking-summary-key">Phim</span>
              <span className="booking-summary-val">{currentMovieTitle || '—'}</span>
            </div>
            {selectedShowtime && (
              <>
                <div className="booking-summary-row">
                  <span className="booking-summary-key">Rạp</span>
                  <span className="booking-summary-val">{f(selectedShowtime, 'theaterName', 'theater_name')}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-key">Phòng</span>
                  <span className="booking-summary-val">{f(selectedShowtime, 'roomName', 'room_name')}</span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-key">Suất chiếu</span>
                  <span className="booking-summary-val">
                    {formatTime(f(selectedShowtime, 'startTime', 'start_time'))}<br />
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>
                      {formatDate(f(selectedShowtime, 'startTime', 'start_time'))}
                    </span>
                  </span>
                </div>
                <div className="booking-summary-row">
                  <span className="booking-summary-key">Giá / ghế</span>
                  <span className="booking-summary-val">{formatPrice(selectedShowtime.price)}</span>
                </div>
              </>
            )}
            <div className="booking-summary-row">
              <span className="booking-summary-key">Số ghế</span>
              <span className="booking-summary-val">{selectedSeatIds.length || '—'}</span>
            </div>
            <div className="booking-summary-total">
              <span className="booking-summary-total-label">Tổng tiền</span>
              <span className="booking-summary-total-amount">
                {selectedSeatIds.length > 0
                  ? formatPrice(selectedSeatIds.length * (selectedShowtime?.price ?? 95000))
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ---- STEP 5: Payment ---- */}
      <SectionCard
        badge="Bước 5"
        title="Thanh toán"
        subtitle="Nhập thông tin thẻ và tiến hành thanh toán."
      >
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Số thẻ</label>
            <input
              className="form-input"
              value={card.card_number}
              onChange={(e) => onCardChange({ ...card, card_number: e.target.value })}
              placeholder="4111 1111 1111 1111"
              maxLength={19}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ngày hết hạn</label>
            <input
              className="form-input"
              value={card.card_expiry}
              onChange={(e) => onCardChange({ ...card, card_expiry: e.target.value })}
              placeholder="MM/YY"
              maxLength={5}
            />
          </div>
          <div className="form-group">
            <label className="form-label">CVV</label>
            <input
              className="form-input"
              value={card.card_cvv}
              onChange={(e) => onCardChange({ ...card, card_cvv: e.target.value })}
              placeholder="123"
              maxLength={4}
              type="password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tên chủ thẻ</label>
            <input
              className="form-input"
              value={card.card_holder}
              onChange={(e) => onCardChange({ ...card, card_holder: e.target.value })}
              placeholder="NGUYEN VAN A"
            />
          </div>
        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary btn-lg"
            onClick={onCreatePayment}
            disabled={!booking || !!payment}
          >
            💳 Thanh toán {booking ? formatPrice(booking.total_amount) : ''}
          </button>
        </div>

        {/* Gateway callback simulator */}
        {payment && (
          <div className="simulator-box">
            <div className="simulator-box-title">🔧 Mô phỏng phản hồi cổng thanh toán</div>
            <div className="gateway-ref">Gateway Ref: {payment.gateway_ref ?? payment.gatewayRef}</div>
            <div className="btn-row">
              <button className="btn btn-success" onClick={() => onCallback('SUCCESS')}>
                ✅ Thanh toán thành công
              </button>
              <button className="btn btn-danger" onClick={() => onCallback('FAILED')}>
                ❌ Thanh toán thất bại
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </>
  );
}
