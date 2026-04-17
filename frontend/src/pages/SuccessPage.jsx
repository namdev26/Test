import { SectionCard } from "../components";

export default function SuccessPage({ ticket }) {
  return (
    <SectionCard
      title="6) Ticket Result"
      subtitle="Kết quả cuối cùng của quy trình đặt vé."
    >
      <pre>{JSON.stringify(ticket, null, 2)}</pre>
    </SectionCard>
  );
}
