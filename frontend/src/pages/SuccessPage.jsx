import { SectionCard } from "../components";

function formatPrice(p) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
}

export default function TicketResultPage({ ticket, booking }) {
  if (!ticket) return null;

  return (
    <SectionCard
      badge="Hoàn tất"
      title="Đặt vé thành công!"
      subtitle="Vui lòng lưu mã vé bên dưới và xuất trình tại rạp."
    >
      <div className="ticket-card">
        <div className="ticket-icon">🎉</div>
        <div className="ticket-success-label">Thanh toán thành công!</div>
        <div className="ticket-sub">Vé của bạn đã được xác nhận. Hẹn gặp bạn tại rạp!</div>

        <div className="ticket-qr">📱</div>
        <div className="ticket-code">{ticket.ticket_code}</div>

        <div className="ticket-info-grid">
          <div className="ticket-info-item">
            <div className="ticket-info-label">Mã vé</div>
            <div className="ticket-info-val">{ticket.ticket_code}</div>
          </div>
          <div className="ticket-info-item">
            <div className="ticket-info-label">Mã booking</div>
            <div className="ticket-info-val">#{ticket.booking_id}</div>
          </div>
          {booking && (
            <>
              <div className="ticket-info-item">
                <div className="ticket-info-label">Số ghế</div>
                <div className="ticket-info-val">{booking.seat_ids?.length || 1} ghế</div>
              </div>
              <div className="ticket-info-item">
                <div className="ticket-info-label">Tổng tiền</div>
                <div className="ticket-info-val" style={{ color: 'var(--gold)' }}>
                  {formatPrice(booking.total_amount)}
                </div>
              </div>
            </>
          )}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>
          Vé điện tử đã được gửi đến email của bạn.
        </p>
      </div>
    </SectionCard>
  );
}
