# Seat Availability Service

## Overview

Seat Availability Service là **Microservice** chịu trách nhiệm quản lý trạng thái ghế ngồi theo từng suất chiếu trong hệ thống đặt vé xem phim:

- **Business domain:** Quản lý tình trạng ghế — kiểm tra, giữ, mở và đánh dấu bán ghế
- **Operations:** Xem sơ đồ ghế, giữ ghế tạm thời theo TTL, mở lại ghế, đánh dấu ghế đã bán

Service này là thành phần có **tần suất truy cập cao nhất** trong hệ thống, được tối ưu cho concurrency và xử lý lock ghế độc lập. Được gọi đồng bộ bởi **Ticket Booking Service** khi tạo và xác nhận booking.

## Tech Stack

| Component | Choice |
|-----------|--------|
| Language | Java |
| Framework | Spring Boot |
| Database | MySQL |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/showtimes/{showtimeId}/seats` | Lấy sơ đồ ghế theo suất chiếu |
| POST | `/showtimes/{showtimeId}/seats/{seatId}/hold` | Giữ ghế tạm thời (TTL) |
| POST | `/showtimes/{showtimeId}/seats/{seatId}/release` | Mở lại ghế |
| POST | `/showtimes/{showtimeId}/seats/{seatId}/sold` | Đánh dấu ghế đã bán |

> Full API specification: [`docs/api-specs/seat-availability-service.yaml`](../../docs/api-specs/seat-availability-service.yaml)

## Seat State Machine

```
AVAILABLE → (hold) → HELD → (sold) → SOLD
HELD → (release / TTL expired) → AVAILABLE
```

- Chỉ ghế `AVAILABLE` mới có thể được `hold`
- Nếu ghế đang `HELD` bởi booking khác → trả về `409 Conflict`

## Running Locally

```bash
# From project root
docker compose up seat-availability-service --build
```

## Project Structure

```
src
├───main
│   ├───java
│   │   └───com
│   │       └───seat
│   │           ├───controller   # REST endpoints
│   │           ├───dto
│   │           ├───exception
│   │           ├───model
│   │           ├───repository
│   │           └───service      # Business logic + seat locking
│   └───resources
└───test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database hostname | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | seat_db |
| `DB_USER` | Database username | root |
| `DB_PASS` | Database password | — |
