import { SectionCard } from "../components";

export default function PaymentPage({
  customer,
  card,
  booking,
  payment,
  countdown,
  onCustomerChange,
  onCardChange,
  onCreateBooking,
  onCreatePayment,
  onCallback
}) {
  return (
    <>
      <SectionCard
        title="4) Customer Info"
        subtitle="Điền thông tin để tạo booking."
      >
        <div className="form-grid">
          <input
            value={customer.name}
            onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
            placeholder="Name"
          />
          <input
            value={customer.email}
            onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
            placeholder="Email"
          />
          <input
            value={customer.phone}
            onChange={(e) => onCustomerChange({ ...customer, phone: e.target.value })}
            placeholder="Phone"
          />
        </div>
        <div className="row">
          <button onClick={onCreateBooking}>Create Booking</button>
          {booking ? <span className="timer">Hold timer: {countdown}</span> : null}
        </div>
      </SectionCard>

      <SectionCard
        title="5) Payment"
        subtitle="Tạo giao dịch và mô phỏng callback gateway."
      >
        <div className="form-grid">
          <input
            value={card.card_number}
            onChange={(e) => onCardChange({ ...card, card_number: e.target.value })}
            placeholder="Card Number"
          />
          <input
            value={card.card_expiry}
            onChange={(e) => onCardChange({ ...card, card_expiry: e.target.value })}
            placeholder="MM/YY"
          />
          <input
            value={card.card_cvv}
            onChange={(e) => onCardChange({ ...card, card_cvv: e.target.value })}
            placeholder="CVV"
          />
          <input
            value={card.card_holder}
            onChange={(e) => onCardChange({ ...card, card_holder: e.target.value })}
            placeholder="Card Holder"
          />
        </div>
        <div className="row">
          <button onClick={onCreatePayment}>Create Payment</button>
          <button onClick={() => onCallback("SUCCESS")} disabled={!payment}>
            Simulate Success
          </button>
          <button onClick={() => onCallback("FAILED")} disabled={!payment}>
            Simulate Failed
          </button>
        </div>
      </SectionCard>
    </>
  );
}
