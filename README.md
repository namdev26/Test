# CineBook — Hệ Thống Đặt Vé Xem Phim Trực Tuyến

[![Stars](https://img.shields.io/github/stars/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/stargazers)
[![Forks](https://img.shields.io/github/forks/hungdn1701/microservices-assignment-starter?style=social)](https://github.com/hungdn1701/microservices-assignment-starter/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Hệ thống đặt vé xem phim trực tuyến theo kiến trúc microservices — tự động hóa toàn bộ quy trình từ duyệt danh sách phim, chọn suất chiếu, giữ ghế, thanh toán, đến phát hành vé điện tử xác nhận. Hệ thống đảm bảo tính nhất quán dữ liệu qua RabbitMQ event-driven và xử lý đồng thời cao với Redis Cache + Idempotency Key.

> **New to this repo?** See [`GETTING_STARTED.md`](GETTING_STARTED.md) for setup instructions and workflow guide.

---

## Team Members

| Name | Student ID | Role | Contribution |
|------|------------|------|-------------|
| Nguyễn Mạnh Cường | B22DCCN099 | Thành viên | Phân tích và thiết kế hệ thống <br> Phát triển và viết tài liệu Movie Service, Seat Availability Service <br> Cấu hình API Gateway (Nginx routing, CORS, rate limiting) <br> Viết tài liệu phân tích và thiết kế kiến trúc hệ thống |
| Đào Đức Hiếu | B22DCCN303 | Thành viên | Phân tích và thiết kế hệ thống <br> Phát triển và viết tài liệu Customer Service, Ticket Booking Service <br> Thiết kế luồng điều phối đặt vé (orchestrator) và tích hợp inter-service HTTP <br> Viết tài liệu phân tích và thiết kế kiến trúc hệ thống |
| Vũ Hoàng Nam | B22DCCN567 | Thành viên | Phân tích và thiết kế hệ thống <br> Phát triển và viết tài liệu Payment Service, Notification Service <br> Phát triển Frontend (React + Vite) và tích hợp API Gateway <br> Cấu hình RabbitMQ event-driven communication, vẽ sơ đồ kiến trúc |

---

## Business Process

**Domain:** Giải trí — Đặt vé xem phim trực tuyến

**Actors:** Khách hàng (người dùng cuối), Cổng thanh toán (hệ thống bên ngoài), Nhân viên rạp (quản trị nội dung phim/lịch chiếu)

**Scope:** Một giao dịch đặt vé cho một phiên người dùng, bao gồm toàn bộ vòng đời:

1. Khách hàng duyệt danh sách phim đang chiếu và chọn phim
2. Khách hàng chọn suất chiếu (rạp, phòng, giờ chiếu)
3. Hệ thống tải sơ đồ ghế và khách hàng chọn ghế
4. Hệ thống kiểm tra và giữ ghế tạm thời (HELD)
5. Khách hàng điền thông tin cá nhân và xác nhận đặt vé
6. Khách hàng điền thông tin thẻ và tiến hành thanh toán
7. Hệ thống gửi yêu cầu đến cổng thanh toán và nhận callback kết quả
8. Nếu thành công: đánh dấu ghế đã bán (SOLD), phát hành mã vé, gửi email xác nhận
9. Nếu thất bại / hết giờ: hủy booking, mở lại ghế (AVAILABLE), gửi email thông báo thất bại

---

## Architecture

![Sơ đồ kiến trúc](./docs/asset/architechture.jpg)

| Component | Responsibility | Tech Stack | Port |
|-----------|----------------|------------|------|
| **Frontend** | Giao diện người dùng — duyệt phim, chọn suất chiếu, chọn ghế, thanh toán | React + Vite | 3000 |
| **API Gateway** | Định tuyến, rate limiting, CORS, single entry point cho mọi request | Nginx | 8081 |
| **Customer Service** | Quản lý hồ sơ khách hàng, tra cứu theo email/ID | Java / Spring Boot | 5001 |
| **Movie Service** | Quản lý phim, rạp chiếu, phòng chiếu, lịch chiếu (showtime) | Java / Spring Boot | 5002 |
| **Seat Availability Service** | Kiểm tra/giữ/mở/đánh dấu bán ghế theo suất chiếu | Java / Spring Boot | 5003 |
| **Ticket Booking Service** | Điều phối toàn bộ luồng đặt vé (orchestrator), phát hành vé điện tử | Java / Spring Boot | 5004 |
| **Payment Service** | Khởi tạo giao dịch, xử lý webhook callback từ cổng thanh toán | Java / Spring Boot | 5005 |
| **Notification Service** | Gửi email xác nhận/thất bại bất đồng bộ qua RabbitMQ | Java / Spring Boot | 5006 |
| **RabbitMQ** | Message broker — truyền event async giữa Payment, Booking, Notification | RabbitMQ | 5672 / 15672 |
| **Redis** | Cache dữ liệu đọc, lưu idempotency key chống double-submit | Redis | 6379 |

> Full documentation: [`docs/architecture.md`](docs/architecture.md) · [`docs/analysis-and-design.md`](docs/analysis-and-design.md)

---

## Getting Started

```bash
# Clone và khởi tạo
git clone <your-fork-url>
cp .env.example .env

# Build và chạy toàn bộ hệ thống
docker compose up --build
```

### Verify

```bash
# Kiểm tra API Gateway
curl http://localhost:8081/health

# Kiểm tra từng service qua Gateway
curl http://localhost:8081/api/customers/health
curl http://localhost:8081/api/movies/health
curl http://localhost:8081/api/showtimes/health
curl http://localhost:8081/api/bookings/health
curl http://localhost:8081/api/payments/health
curl http://localhost:8081/api/notifications/health
```

---

## API Documentation

- [Customer Service — OpenAPI Spec](docs/api-specs/customer-service.yaml)
- [Movie Service — OpenAPI Spec](docs/api-specs/movie-service.yaml)
- [Seat Availability Service — OpenAPI Spec](docs/api-specs/seat-availability-service.yaml)
- [Ticket Booking Service — OpenAPI Spec](docs/api-specs/ticket-booking-service.yaml)
- [Payment Service — OpenAPI Spec](docs/api-specs/payment-service.yaml)
- [Notification Service — OpenAPI Spec](docs/api-specs/notification-service.yaml)

---

## License

This project uses the [MIT License](LICENSE).

> Template by [Hung Dang](https://github.com/hungdn1701) · [Template guide](GETTING_STARTED.md)
