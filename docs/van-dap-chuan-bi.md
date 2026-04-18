# Tài Liệu Vấn Đáp — CineBook Microservices
> Ôn tập trước buổi bảo vệ. Mỗi người học phần của mình + phần chung.

---

## 📌 PHẦN CHUNG — Tất cả thành viên phải nắm

### 1. Microservices là gì? Tại sao dùng?

> **Microservices** là kiến trúc chia ứng dụng thành các service nhỏ, **độc lập**, mỗi service chịu trách nhiệm một nghiệp vụ cụ thể, giao tiếp với nhau qua API hoặc message broker.

**Lợi ích:**
- **Độc lập deploy**: Cập nhật movie-service không ảnh hưởng payment-service
- **Scale riêng lẻ**: Seat Availability Service bị tải cao → scale riêng, không cần scale cả hệ thống
- **Công nghệ linh hoạt**: Có thể dùng Java cho backend, React cho frontend

**Nhược điểm phải biết:**
- Phức tạp hơn monolith (network latency, distributed transaction)
- Khó debug hơn (log phân tán ở nhiều service)

---

### 2. Business Process của hệ thống là gì?

> Domain: **Giải trí — Đặt vé xem phim trực tuyến**

Luồng 9 bước:
1. Khách hàng duyệt phim → chọn suất chiếu
2. Xem sơ đồ ghế → chọn ghế
3. Hệ thống **giữ ghế tạm thời** (HELD)
4. Khách hàng nhập thông tin cá nhân
5. Xác nhận booking
6. Nhập thông tin thẻ → thanh toán
7. Hệ thống gửi yêu cầu đến cổng thanh toán
8. **Thành công**: mark ghế SOLD → phát vé → gửi email
9. **Thất bại**: mở lại ghế → gửi email thông báo

---

### 3. Hệ thống có những service nào? Nhiệm vụ từng service?

| Service | Nhiệm vụ | Loại |
|---|---|---|
| **Customer Service** | Quản lý hồ sơ khách hàng | Entity Service |
| **Movie Service** | Quản lý phim, rạp, lịch chiếu | Entity Service |
| **Seat Availability Service** | Quản lý trạng thái ghế | Entity Service |
| **Ticket Booking Service** | Điều phối toàn bộ luồng đặt vé | Task Service (Orchestrator) |
| **Payment Service** | Xử lý thanh toán, webhook | Entity Service |
| **Notification Service** | Gửi email bất đồng bộ | Utility Service |

---

### 4. Service giao tiếp với nhau như thế nào?

**HTTP Synchronous (đồng bộ):**
- Ticket Booking → Customer Service: resolve/tạo khách hàng
- Ticket Booking → Seat Availability: hold/release/sold ghế

**RabbitMQ Asynchronous (bất đồng bộ):**
- Payment Service publish → `payment.success` hoặc `payment.failed`
- Ticket Booking Service subscribe → cập nhật booking, publish tiếp
- Notification Service subscribe → gửi email

**Tại sao dùng 2 loại?**
> HTTP dùng khi cần kết quả ngay (hold ghế phải biết có thành công không). RabbitMQ dùng khi không cần kết quả tức thì (gửi email có thể chậm 1-2 giây cũng được, không nên block user chờ).

---

### 5. API Gateway là gì? Tại sao cần?

> **API Gateway** (Nginx) là điểm vào **duy nhất** của hệ thống từ phía client.

**Chức năng:**
- **Routing**: `/api/movies/*` → movie-service, `/api/bookings/*` → booking-service
- **CORS**: xử lý Cross-Origin cho React frontend
- **Single entry point**: Frontend chỉ cần biết 1 địa chỉ (port 8081)

**Câu hỏi hay bị hỏi:** "Nếu không có Gateway thì sao?"
> Frontend phải biết địa chỉ từng service (5001, 5002...), khó quản lý, lộ internal ports ra ngoài.

---

### 6. Database per Service là gì?

> Mỗi service có **database riêng**, không service nào truy cập DB của service khác.

**Lợi ích:** Service thay đổi schema DB nội bộ mà không ảnh hưởng service khác.

**Trong dự án:** Mỗi service dùng H2 in-memory riêng biệt (customerdb, moviedb, seatdb, bookingdb, paymentdb).

---

### 7. H2 Database là gì? Tại sao dùng?

> H2 là **embedded in-memory database** chạy trong JVM, không cần cài server DB riêng.

**Tại sao dùng cho assignment:** Đơn giản, không cần cấu hình MySQL/PostgreSQL, phù hợp demo và development.

**Nhược điểm:** Data mất khi container restart. Nếu production cần MySQL/PostgreSQL.

---

### 8. Docker Compose là gì?

> Công cụ định nghĩa và chạy **nhiều container Docker** cùng lúc bằng 1 file `docker-compose.yml`.

```bash
docker compose up --build   # build image và khởi động tất cả
docker compose down          # dừng và xóa container
docker compose ps            # xem trạng thái
```

**Trong dự án:** 1 lệnh khởi động 10 container: 6 services + gateway + frontend + rabbitmq + redis.

---

### 9. GET /health endpoint dùng để làm gì?

> Endpoint kiểm tra service còn sống không. Trả về `{"data":"ok"}` với HTTP 200.

**Công dụng:**
- Docker healthcheck tự động restart container nếu service chết
- Monitoring hệ thống (Uptime Robot, Prometheus...)
- Verify sau khi deploy

---

## 👤 NGUYỄN MẠNH CƯỜNG (B22DCCN099)
### Phụ trách: Movie Service · Seat Availability Service · API Gateway

---

### Q: Movie Service quản lý những gì?

> 3 entity chính: **Movie** (phim), **Theater** (rạp chiếu), **Showtime** (suất chiếu).

- `GET /movies` — danh sách phim đang chiếu
- `GET /movies/{id}` — chi tiết một phim
- `GET /movies/{id}/showtimes` — lịch chiếu của phim đó

**Data flow:** Frontend gọi Gateway → Gateway forward đến Movie Service → Service query H2 DB → trả JSON về.

---

### Q: Seat Availability Service hoạt động thế nào?

> Quản lý trạng thái từng ghế theo từng suất chiếu.

**State machine:**
```
AVAILABLE → (hold) → HELD → (sold) → SOLD
HELD → (release / timeout) → AVAILABLE
```

**Endpoints:**
- `GET /showtimes/{id}/seats` — lấy sơ đồ ghế
- `POST /seats/{id}/hold` — giữ ghế (chuyển AVAILABLE → HELD)
- `POST /seats/{id}/release` — mở ghế lại (HELD → AVAILABLE)
- `POST /seats/{id}/sold` — đánh dấu đã bán (HELD → SOLD)

---

### Q: Tại sao cần Optimistic Locking khi hold ghế?

> Nếu 2 user cùng chọn ghế A1 đúng lúc, không có locking → cả 2 đều được hold thành công → 1 ghế bán cho 2 người.

**Giải pháp:** JPA `@Version` field. Khi update, Hibernate kiểm tra version hiện tại DB có khớp không. Nếu không khớp (người khác đã modify) → throw `OptimisticLockException` → trả 409 Conflict cho user đến sau.

---

### Q: Nginx routing hoạt động thế nào?

```nginx
location /api/movies {
    rewrite ^/api/(.*)$ /$1 break;   # bỏ prefix /api
    proxy_pass http://movie_svc;      # forward đến movie-service:5000
}
```

> Request `GET /api/movies` → Nginx bỏ `/api` → forward thành `GET /movies` đến movie-service.

---

### Q: Seed data là gì? Tại sao cần?

> File `data.sql` chứa INSERT statements chạy tự động khi service start (do `spring.sql.init.mode=always`).

Nhờ seed data, ngay khi chạy docker compose đã có phim, rạp, suất chiếu → demo ngay được mà không cần nhập tay.

---

## 👤 ĐÀO ĐỨC HIẾU (B22DCCN303)
### Phụ trách: Customer Service · Ticket Booking Service · docker-compose

---

### Q: Customer Service làm gì? Tại sao không gộp vào Booking Service?

> Customer Service chịu trách nhiệm **duy nhất** quản lý hồ sơ khách hàng (name, email, phone).

**Tại sao tách riêng (Single Responsibility):**
- Booking Service chỉ cần biết customerId, không cần biết email/phone chi tiết được lưu thế nào
- Customer Service có thể thêm tính năng (loyalty points, profile) mà không ảnh hưởng booking

---

### Q: Ticket Booking Service là gì? Orchestrator nghĩa là gì?

> **Orchestrator** = service điều phối, gọi tuần tự các service khác để hoàn thành một nghiệp vụ phức tạp.

**Luồng `POST /bookings`:**
1. Nhận request từ Frontend
2. Gọi HTTP → Customer Service: tìm theo email, nếu chưa có thì tạo mới
3. Gọi HTTP → Seat Service: hold ghế (nếu 409 → trả lỗi ngay)
4. Tạo Booking trong DB với status `PENDING_PAYMENT`
5. Trả bookingId về cho Frontend

**Frontend sau đó** gọi Payment Service với bookingId để thanh toán.

---

### Q: RestTemplate dùng để làm gì?

> `RestTemplate` là Spring HTTP client dùng để gọi REST API của service khác.

```java
// Booking Service gọi Customer Service
CustomerResponse customer = restTemplate.getForObject(
    customerServiceUrl + "/customers/by-email?email=" + email,
    CustomerResponse.class
);
```

---

### Q: RabbitMQ consumer trong Booking Service xử lý event thế nào?

**Khi nhận `payment.success`:**
1. Tìm booking theo bookingId trong event
2. Cập nhật status → `CONFIRMED`
3. Sinh `ticketCode` (UUID)
4. Publish event `ticket.created` → Notification Service gửi email vé

**Khi nhận `payment.failed`:**
1. Cập nhật status → `FAILED`
2. Gọi HTTP → Seat Service: release ghế (HELD → AVAILABLE)
3. Publish event `booking.failed` → Notification Service gửi email thất bại

---

### Q: docker-compose.yml cấu hình gì quan trọng?

**`depends_on`:** Đảm bảo RabbitMQ healthy trước khi các service Java khởi động (tránh lỗi connection refused).

**`networks`:** Tất cả service cùng `app-network` → giao tiếp qua tên service thay vì IP (Docker DNS: `http://customer-service:5000`).

**`healthcheck`:** RabbitMQ và Redis có healthcheck → Docker tự restart nếu chết.

---

### Q: Idempotency Key là gì?

> Cơ chế đảm bảo **cùng một request** dù gửi nhiều lần (do network lỗi, user double-click) chỉ được xử lý **một lần**.

Frontend sinh UUID, gắn vào header `Idempotency-Key`. Payment Service kiểm tra key này trong DB trước khi xử lý.

---

## 👤 VŨ HOÀNG NAM (B22DCCN567)
### Phụ trách: Payment Service · Notification Service · Frontend

---

### Q: Payment Service xử lý thanh toán như thế nào?

**Luồng `POST /payments`:**
1. Kiểm tra `Idempotency-Key` header → nếu đã xử lý rồi, return cached result
2. Tạo `PaymentTransaction` với status `PENDING`
3. Gửi request đến payment gateway (giả lập: số thẻ `4111...` → SUCCESS)
4. Nhận callback webhook `POST /payments/callback`
5. Cập nhật status `SUCCESS/FAILED`
6. Publish event tương ứng lên RabbitMQ

---

### Q: Tại sao Payment Service dùng Webhook thay vì gọi trực tiếp?

> Thanh toán cần thời gian xử lý phía ngân hàng (vài giây đến vài phút). Dùng **webhook** (callback bất đồng bộ) thay vì chờ response → tránh timeout HTTP.

**Flow:** Frontend → Payment Service → Gateway bên ngoài (async) → Gateway gọi lại `/payments/callback` khi có kết quả.

---

### Q: Notification Service dùng Inbox Pattern là gì?

> **Inbox Pattern** = trước khi xử lý event, kiểm tra đã xử lý event này chưa (lưu messageId trong Redis).

**Tại sao cần:** RabbitMQ đảm bảo **at-least-once delivery** — có thể deliver cùng event nhiều lần nếu consumer crash. Inbox Pattern đảm bảo email chỉ gửi đúng 1 lần.

**Luồng:**
1. Nhận event từ RabbitMQ
2. Check Redis: `EXISTS notification:{messageId}`
3. Nếu tồn tại → bỏ qua (đã gửi rồi)
4. Nếu không → gửi email → `SET notification:{messageId} 1 EX 86400`

---

### Q: Redis dùng để làm gì trong hệ thống?

Hai mục đích:
1. **Notification Service**: Lưu `messageId` đã xử lý (Inbox Pattern — tránh gửi email trùng)
2. **Payment Service**: Lưu idempotency key đã xử lý (tránh tạo transaction trùng)

---

### Q: Frontend gọi API như thế nào? Có vượt qua CORS không?

> Frontend (port 3000) gọi Gateway (port 8081) → **khác port là cross-origin**.

**Giải pháp:** Nginx Gateway thêm header:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

Frontend dùng `fetch()` gọi `http://localhost:8081/api/movies` → Nginx forward đến movie-service.

---

### Q: Tại sao dùng Vite thay vì Create React App?

> Vite nhanh hơn CRA vì dùng ES modules native (không bundle như Webpack). Hot reload gần như tức thì.

Trong dự án không quan trọng lắm (assignment), nhưng nếu hỏi thì nói: Vite là standard mới của React ecosystem, được recommend chính thức.

---

### Q: Thymeleaf dùng để làm gì?

> Template engine của Spring Boot, render **HTML email** từ template và data động.

```html
<!-- ticket-success.html -->
<p th:text="'Xin chào, ' + ${customerName}"></p>
<p th:text="'Phim: ' + ${movieTitle}"></p>
<p th:text="'Mã vé: ' + ${ticketCode}"></p>
```

Notification Service lấy data từ RabbitMQ event, đưa vào Thymeleaf context → render HTML → gửi qua SMTP.

---

## 🎯 CÂU HỎI KHÓ — Thầy hay hỏi bất kỳ ai

| Câu hỏi | Trả lời ngắn |
|---|---|
| "Nếu Seat Service chết khi đang hold ghế thì sao?" | Booking fail, user nhận lỗi 500. Cần circuit breaker (Resilience4j) để handle — là hướng cải thiện. |
| "Tại sao không dùng MySQL thay vì H2?" | H2 đủ cho demo/assignment. Production nên MySQL để data persist khi restart. |
| "Saga Pattern là gì?" | Pattern xử lý distributed transaction trong microservices. Có 2 loại: Choreography (event-driven, mình đang dùng) và Orchestration (service trung tâm điều phối). |
| "Nhóm bạn đang dùng loại Saga nào?" | Choreography: Payment publish event → Booking subscribe → Notification subscribe. Không có service trung tâm điều hướng saga. |
| "Scale service nào khi load cao?" | Seat Availability Service — vì nhiều user truy cập cùng lúc để xem ghế và hold ghế. |
| "Làm thế nào để biết service đang chạy?" | Gọi `GET /health` — trả 200 là đang chạy. Hoặc dùng `docker compose ps`. |
