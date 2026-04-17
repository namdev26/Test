# System Architecture

> This document is completed **after** [Analysis and Design](analysis-and-design.md).
> Based on the Service Candidates and Non-Functional Requirements identified there, select appropriate architecture patterns and design the deployment architecture.

**References:**
1. *Service-Oriented Architecture: Analysis and Design for Services and Microservices* — Thomas Erl (2nd Edition)
2. *Microservices Patterns: With Examples in Java* — Chris Richardson
3. *Bài tập — Phát triển phần mềm hướng dịch vụ* — Hung Dang (available in Vietnamese)

---

## 1. Pattern Selection

Select patterns based on business/technical justifications from your analysis.

| Pattern | Selected? | Business/Technical Justification |
|---------|----------|---------------------------|
| API Gateway | Có | Điểm vào duy nhất cho mọi request từ client. Thực hiện routing, rate limiting và chuyển tiếp request đến đúng service theo URI. |
| Database per Service | Có | Mỗi service nghiệp vụ (Customer, Movie, Seat Availability, Ticket Booking, Payment, Notification) sở hữu dữ liệu riêng để giảm coupling và cho phép thay đổi schema độc lập. |
| Shared Database | Không | Dễ gây coupling giữa service, khó triển khai độc lập và khó tách ownership dữ liệu. |
| Saga (Choreography) | Có | Luồng đặt vé gồm nhiều bước qua Ticket Booking, Seat Availability, Payment và Notification; các bước được đồng bộ trạng thái qua event thay vì transaction phân tán. |
| Event-driven / Message Queue | Có | Dùng RabbitMQ cho giao tiếp async giữa các service để giảm phụ thuộc thời gian thực và tăng khả năng chịu tải giờ cao điểm. |
| Outbox + Inbox Pattern | Có | Đảm bảo event không bị mất khi publish và chống xử lý trùng ở consumer (message_id duy nhất trong inbox). |
| CQRS | Không | Quy mô hiện tại chưa cần tách riêng read/write model; Redis cache đã đáp ứng nhu cầu đọc nhanh. |
| Circuit Breaker | Không | Chưa bắt buộc trong môi trường local assignment; có thể bổ sung khi lên production. |
| Service Registry / Discovery | Không | Dùng Docker Compose DNS và cấu hình endpoint qua biến môi trường, chưa cần service discovery động. |
| Idempotency Key | Có | Áp dụng ở API tạo booking và thanh toán để chống double-submit từ frontend khi retry/network timeout. |
| Cache-aside (Redis) | Có | Cache danh sách phim, lịch chiếu và trạng thái ghế để giảm tải DB và cải thiện response time. |

---

## 2. System Components

| Component | Responsibility | Tech Stack | Port |
|-----------|-------------|------------|------|
| Frontend | Giao diện người dùng: duyệt phim, chọn suất chiếu, chọn ghế, thanh toán | React | 3000 |
| API Gateway + Load Balancer | Routing request, rate limiting, cân bằng tải service | Nginx | 8081 |
| Customer Service | Quản lý thông tin khách hàng | Java + Spring Boot | 5001 |
| Movie Service | Quản lý phim, rạp, lịch chiếu | Java + Spring Boot | 5002 |
| Seat Availability Service | Kiểm tra/giữ/mở/đánh dấu bán ghế theo suất chiếu | Java + Spring Boot | 5003 |
| Ticket Booking Service | Điều phối và xử lý nghiệp vụ đặt vé | Java + Spring Boot | 5004 |
| Payment Service | Khởi tạo giao dịch và xử lý callback thanh toán | Java + Spring Boot | 5005 |
| Notification Service | Gửi email thông báo bất đồng bộ | Java + Spring Boot | 5006 |
| Customer DB | Lưu hồ sơ khách hàng | MySQL | 3306 |
| Movie DB | Lưu phim, rạp, lịch chiếu | MySQL | 3306 |
| Seat DB | Lưu seat inventory và trạng thái ghế theo suất chiếu | MySQL | 3306 |
| Booking DB | Lưu booking, ticket, outbox/inbox | MySQL | 3306 |
| Payment DB | Lưu payment transaction, callback log, outbox/inbox | MySQL | 3306 |
| Notification DB | Lưu lịch sử gửi email và trạng thái gửi | MySQL | 3306 |
| Redis | Cache dữ liệu đọc và lưu idempotency key | Redis | 6379 |
| RabbitMQ | Message broker cho event-driven communication | RabbitMQ | 5672 / 15672 (management UI) |

---

## 3. Communication

### Inter-service Communication Matrix

| From → To  | Customer Svc | Movie Svc | Seat Svc | Booking Svc | Payment Svc | Notif Svc | Payment GW | RabbitMQ |
|----------|--------------|-----------|----------|-------------|-------------|-----------|-----------|----------|
| **Client** | — | HTTP sync (xem phim/lịch chiếu) | HTTP sync (xem ghế) | HTTP sync (tạo booking, xem booking) | HTTP sync (khởi tạo thanh toán) | — | — | — |
| **Booking Svc** | HTTP sync (tra cứu/tạo customer) | HTTP sync (xác minh suất chiếu) | HTTP sync (hold/release/sold) | — | Consume event/payment status | Publish event yêu cầu gửi mail | — | Publish/Consume |
| **Payment Svc** | — | — | — | Publish payment.success/payment.failed | — | — | HTTP sync (charge/callback integration) | Publish/Consume |
| **Seat Svc** | — | — | — | — | — | — | — | Publish seat.held, consume booking.success/booking.failed |
| **Notif Svc** | — | — | — | — | — | — | — | Consume ticket.created, booking.failed |
| **RabbitMQ** | — | — | Deliver events | Deliver events | Deliver events | Deliver events | — | — |

### Event Flow Summary Table

| Event | Service Publish | Service Nhận | Thời điểm kích hoạt |
|-------|----------------|-------------|---------------------|
| seat.held | Seat Availability Service (outbox) | Ticket Booking Service (inbox) | Ghế được giữ thành công |
| booking.created | Ticket Booking Service (outbox) | Payment Service (inbox) | Booking được tạo ở trạng thái chờ thanh toán |
| payment.success | Payment Service (outbox) | Ticket Booking Service, Seat Availability Service, Notification Service (inbox) | Gateway callback thành công |
| payment.failed | Payment Service (outbox) | Ticket Booking Service, Seat Availability Service, Notification Service (inbox) | Gateway callback thất bại |
| ticket.created | Ticket Booking Service (outbox) | Notification Service (inbox) | Vé điện tử được sinh sau thanh toán thành công |

---

## 4. Architecture Diagram

![Architecture](./asset/architechture.jpg)

---

## 5. Deployment

- All services containerized with Docker
- Orchestrated via Docker Compose
- Single command: `docker compose up --build`

### Danh Sách Service trong Docker Compose

```yaml
services:
  nginx:                     # API Gateway + Load Balancer
  customer-service:
  movie-service:
  seat-availability-service:
  ticket-booking-service:
  payment-service:
  notification-service:
  customer-db:               # MySQL
  movie-db:                  # MySQL
  seat-db:                   # MySQL
  booking-db:                # MySQL
  payment-db:                # MySQL
  notification-db:           # MySQL
  redis:
  rabbitmq:
```
