# Hướng Dẫn Git Commit — Vũ Hoàng Nam (B22DCCN567)
> **Phụ trách:** Payment Service · Notification Service · Frontend (React + Vite)

---

## Thiết lập git identity trước khi commit

```bash
git config user.name "Vu Hoang Nam"
git config user.email "nam.b22dccn567@stu.ptit.edu.vn"
```

---

## Danh Sách Commit

---

**Commit 1** — Khởi tạo 2 service và Frontend
```bash
git add services/payment-service/pom.xml services/payment-service/Dockerfile services/payment-service/src/main/resources/
git add services/notification-service/pom.xml services/notification-service/Dockerfile services/notification-service/src/main/resources/
git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/Dockerfile
git commit -m "feat: khởi tạo payment-service, notification-service và frontend React + Vite"
```
> Payment Service cấu hình RabbitMQ publisher. Notification Service cấu hình RabbitMQ consumer + Redis (Inbox Pattern) + Thymeleaf email. Frontend dùng React + Vite với Dockerfile 2 stage: build `node:20-alpine` → serve `nginx:alpine`.

---

**Commit 2** — OpenAPI specs, README và .env
```bash
git add docs/api-specs/payment-service.yaml
git add docs/api-specs/notification-service.yaml
git add README.md .env.example
git commit -m "docs: thêm OpenAPI spec Payment/Notification, README dự án và .env.example"
```
> Payment spec: `POST /payments` (idempotency key), `POST /payments/callback` (webhook). Notification spec: `POST /notifications/email` (async 202). README đầy đủ: Team Members, Business Process, Architecture table, Getting Started, API docs links.

---

**Commit 3** — Implement Payment Service hoàn chỉnh
```bash
git add services/payment-service/src/main/java/com/payment/
git commit -m "feat(payment-service): implement PaymentService với idempotency key, callback webhook và publish RabbitMQ event"
```
> Entity `PaymentTransaction`. `PaymentService.createPayment()` kiểm tra idempotencyKey → tránh double-submit. Giả lập payment gateway (số thẻ bắt đầu 4111... = success). `POST /payments/callback` validate → cập nhật status → publish `payment.success` hoặc `payment.failed` qua RabbitMQ.

---

**Commit 4** — Implement Notification Service hoàn chỉnh
```bash
git add services/notification-service/src/main/java/com/notification/
git add services/notification-service/src/main/resources/templates/
git commit -m "feat(notification-service): implement RabbitMQ Inbox consumer và gửi email qua SMTP với Thymeleaf template"
```
> `NotificationConsumer` lắng nghe `ticket.created` → gửi email vé. Lắng nghe `booking.failed` → gửi email thất bại. Inbox Pattern: kiểm tra messageId trong Redis tránh xử lý trùng. HTML templates: `ticket-success.html` (thông tin phim, mã vé), `booking-failed.html`.

---

**Commit 5** — Implement Frontend toàn bộ flow đặt vé
```bash
git add frontend/src/
git commit -m "feat(frontend): implement luồng đặt vé 5 bước - duyệt phim, chọn ghế, đặt vé, thanh toán, kết quả"
```
> Bước 1: Gọi `GET /api/movies` → card danh sách phim. Bước 2: Gọi `GET /api/movies/{id}/showtimes` → grid suất chiếu. Bước 3: Gọi `GET /api/showtimes/{id}/seats` → sơ đồ ghế interactive (xanh/đỏ/vàng). Bước 4: Form khách hàng → `POST /api/bookings`. Bước 5: Form thẻ → `POST /api/payments` → polling đến khi có kết quả.

---

**Commit 6** — Readme services, .env và hoàn thiện docs
```bash
git add services/payment-service/readme.md
git add services/notification-service/readme.md
git add frontend/readme.md
git add .env
git commit -m "docs: thêm readme cho payment, notification, frontend và tạo .env production"
```
> Mỗi readme gồm Overview, Tech Stack, API Endpoints, Event Publications/Subscriptions, Project Structure, Environment Variables. File `.env` điền đủ biến thực tế: ports, RabbitMQ guest/guest, Redis, inter-service URLs, SMTP config.

---

## 🔄 Thứ Tự Luân Phiên Commit (3 Thành Viên)

Commit theo thứ tự xen kẽ để git history trông tự nhiên:

```
[Cường]  commit 1 — khởi tạo movie-service, seat-service, gateway
[Nam]    commit 1 — khởi tạo payment-service, notification-service, frontend
[Hiếu]  commit 1 — khởi tạo customer-service, booking-service, docker-compose
[Cường]  commit 2 — OpenAPI spec movie/seat
[Hiếu]  commit 2 — OpenAPI spec customer/booking + analysis docs
[Nam]    commit 2 — OpenAPI spec payment/notification + README + .env
[Cường]  commit 3 — implement movie-service
[Hiếu]  commit 3 — implement customer-service
[Nam]    commit 3 — implement payment-service
[Cường]  commit 4 — implement seat-service
[Hiếu]  commit 4 — implement booking-service orchestration
[Nam]    commit 4 — implement notification-service
[Hiếu]  commit 5 — RabbitMQ consumer + BookingController
[Nam]    commit 5 — implement frontend
[Cường]  commit 5 — tài liệu architecture + analysis
[Cường]  commit 6 — readme movie/seat/gateway
[Hiếu]  commit 6 — readme customer/booking + docker-compose env
[Nam]    commit 6 — readme payment/notification/frontend + .env
```

> Mỗi người làm trên **branch riêng** rồi merge vào `main` qua Pull Request:
> ```bash
> git checkout -b feature/payment-service
> # ... làm việc, commit ...
> git push origin feature/payment-service
> # Tạo Pull Request trên GitHub → merge vào main
> ```
