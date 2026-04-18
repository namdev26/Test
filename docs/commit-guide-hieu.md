# Hướng Dẫn Git Commit — Đào Đức Hiếu (B22DCCN303)
> **Phụ trách:** Customer Service · Ticket Booking Service · docker-compose

---

## Thiết lập git identity trước khi commit

```bash
git config user.name "Dao Duc Hieu"
git config user.email "hieu.b22dccn303@stu.ptit.edu.vn"
```

---

## Danh Sách Commit

---

**Commit 1** — Khởi tạo 2 service và docker-compose
```bash
git add services/customer-service/pom.xml services/customer-service/Dockerfile services/customer-service/src/main/resources/
git add services/ticket-booking-service/pom.xml services/ticket-booking-service/Dockerfile services/ticket-booking-service/src/main/resources/
git add docker-compose.yml
git commit -m "feat: khởi tạo customer-service, ticket-booking-service và docker-compose orchestration"
```
> Tạo Spring Boot project cho customer-service (quản lý hồ sơ khách hàng) và ticket-booking-service (orchestrator điều phối đặt vé). docker-compose.yml định nghĩa toàn bộ 10 service với đúng port, `depends_on`, `app-network` bridge.

---

**Commit 2** — OpenAPI specs và phân tích tài liệu
```bash
git add docs/api-specs/customer-service.yaml
git add docs/api-specs/ticket-booking-service.yaml
git add docs/analysis-and-design.md
git commit -m "docs: thêm OpenAPI spec cho Customer/Booking Service và hoàn thiện analysis-and-design.md"
```
> OpenAPI spec Customer Service: `POST /customers`, `GET /customers/{id}`, `GET /customers/by-email`. Booking Service: `POST /bookings`, `GET /bookings/{id}`, `POST /bookings/{id}/cancel`, `GET /bookings/{id}/ticket`. Tài liệu phân tích đầy đủ Part 1, 2, 3 (Business Process, Service Candidates, Service Contracts).

---

**Commit 3** — Implement Customer Service hoàn chỉnh
```bash
git add services/customer-service/src/main/java/com/customer/
git commit -m "feat(customer-service): implement Entity, Repository, Service, Controller với POST /customers và GET by id/email"
```
> Entity Customer (id, name, email, phone, createdAt). Repository có `findByEmail()`. Service kiểm tra email trùng → 409 DuplicateEmailException. Controller expose đủ endpoints + `GET /health`. DTO `CreateCustomerRequest` với validation `@Email`, `@NotBlank`.

---

**Commit 4** — Implement Ticket Booking Service — orchestration core
```bash
git add services/ticket-booking-service/src/main/java/com/booking/model/
git add services/ticket-booking-service/src/main/java/com/booking/config/
git add services/ticket-booking-service/src/main/java/com/booking/service/
git commit -m "feat(booking-service): implement orchestration tạo booking - resolve customer, hold seat, tạo booking PENDING"
```
> `BookingService.createBooking()`: (1) Gọi HTTP `GET /customers/by-email` tại Customer Service, tạo mới nếu chưa tồn tại. (2) Gọi HTTP `POST /seats/{id}/hold` tại Seat Service. (3) Tạo booking PENDING_PAYMENT. RestTemplateConfig bean cho inter-service HTTP calls.

---

**Commit 5** — RabbitMQ consumer và BookingController
```bash
git add services/ticket-booking-service/src/main/java/com/booking/controller/
git add services/ticket-booking-service/src/main/java/com/booking/dto/
git commit -m "feat(booking-service): thêm RabbitMQ consumer payment event và BookingController đầy đủ endpoints"
```
> Consumer lắng nghe `payment.success` → cập nhật CONFIRMED, sinh ticketCode, publish `ticket.created`. Consumer lắng nghe `payment.failed` → cập nhật FAILED, release ghế, publish `booking.failed`. Controller expose `POST /bookings`, `GET /bookings/{id}`, `GET /bookings/{id}/ticket`, `GET /health`.

---

**Commit 6** — Readme và cập nhật docker-compose env
```bash
git add services/customer-service/readme.md
git add services/ticket-booking-service/readme.md
git add docker-compose.yml
git commit -m "docs: thêm readme cho customer-service, ticket-booking-service và cập nhật env docker-compose"
```
> Mỗi readme gồm Overview, Tech Stack, API Endpoints, Event Subscriptions (booking-service), Project Structure, Environment Variables. Cập nhật docker-compose thêm `CUSTOMER_SERVICE_URL` và `SEAT_SERVICE_URL` cho ticket-booking-service.

---

## Thứ Tự Luân Phiên (xem file commit-guide-nam.md)
