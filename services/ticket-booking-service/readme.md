# Ticket Booking Service

## Overview

Ticket Booking Service là **Task Service** trung tâm, điều phối toàn bộ luồng nghiệp vụ đặt vé xem phim:

- **Business domain:** Điều phối đặt vé (Orchestrator) — xác thực khách hàng, giữ ghế, tạo booking, phát hành vé điện tử
- **Operations:** Tạo booking, tra cứu booking, hủy booking, lấy vé điện tử sau khi thanh toán thành công

Service này giao tiếp:
- **HTTP sync** → Customer Service (resolve/tạo customer), Seat Availability Service (hold/sold ghế)
- **RabbitMQ** → nhận `payment.success` / `payment.failed` từ Payment Service → phát `ticket.created` / `booking.failed` đến Notification Service

## Tech Stack

| Component | Choice |
|-----------|--------|
| Language | Java |
| Framework | Spring Boot |
| Message Broker | RabbitMQ |
| Database | MySQL |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/bookings` | Tạo booking mới |
| GET | `/bookings/{id}` | Lấy chi tiết booking |
| POST | `/bookings/{id}/cancel` | Hủy booking |
| GET | `/bookings/{id}/ticket` | Lấy vé điện tử của booking |

> Full API specification: [`docs/api-specs/ticket-booking-service.yaml`](../../docs/api-specs/ticket-booking-service.yaml)

## Event Subscriptions (RabbitMQ)

| Event | Hành động |
|-------|-----------|
| `payment.success` | Cập nhật booking → CONFIRMED, sinh ticketCode, publish `ticket.created` |
| `payment.failed` | Cập nhật booking → FAILED, release ghế, publish `booking.failed` |

## Running Locally

```bash
# From project root
docker compose up ticket-booking-service --build
```

## Project Structure

```
src
├───main
│   ├───java
│   │   └───com
│   │       └───booking
│   │           ├───config       # RabbitMQ config
│   │           ├───controller   # REST endpoints
│   │           ├───dto
│   │           ├───exception
│   │           ├───model
│   │           ├───repository
│   │           └───service      # Orchestration logic
│   └───resources
└───test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database hostname | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | booking_db |
| `DB_USER` | Database username | root |
| `DB_PASS` | Database password | — |
| `CUSTOMER_SERVICE_URL` | URL của Customer Service | http://customer-service:5000 |
| `SEAT_SERVICE_URL` | URL của Seat Availability Service | http://seat-availability-service:5000 |
| `RABBITMQ_HOST` | RabbitMQ hostname | rabbitmq |
| `RABBITMQ_PORT` | RabbitMQ port | 5672 |
| `RABBITMQ_USER` | RabbitMQ username | guest |
| `RABBITMQ_PASSWORD` | RabbitMQ password | guest |
