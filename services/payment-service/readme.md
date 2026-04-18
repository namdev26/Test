# Payment Service

## Overview

Payment Service là **Microservice** chịu trách nhiệm xử lý toàn bộ nghiệp vụ thanh toán trong hệ thống đặt vé xem phim:

- **Business domain:** Thanh toán — khởi tạo giao dịch, kết nối cổng thanh toán bên ngoài, nhận webhook callback
- **Operations:** Khởi tạo payment transaction, nhận callback từ Payment Gateway, phát sự kiện kết quả thanh toán

Service này tích hợp hệ thống bên thứ ba, được cô lập hoàn toàn để giảm thiểu rủi ro lan rộng. Hỗ trợ **idempotency key** để chống double-submit khi frontend retry.

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
| POST | `/payments` | Khởi tạo giao dịch thanh toán (idempotency key) |
| GET | `/payments/{id}` | Lấy trạng thái giao dịch |
| POST | `/payments/callback` | Nhận webhook callback từ cổng thanh toán |

> Full API specification: [`docs/api-specs/payment-service.yaml`](../../docs/api-specs/payment-service.yaml)

## Event Publications (RabbitMQ)

| Event | Thời điểm phát |
|-------|----------------|
| `payment.success` | Gateway callback trả về thành công |
| `payment.failed` | Gateway callback trả về thất bại |

## Running Locally

```bash
# From project root
docker compose up payment-service --build
```

## Project Structure

```
src
├───main
│   ├───java
│   │   └───com
│   │       └───payment
│   │           ├───config       # RabbitMQ config
│   │           ├───controller   # REST endpoints
│   │           ├───dto
│   │           ├───exception
│   │           ├───model
│   │           ├───repository
│   │           └───service      # Payment logic + gateway integration
│   └───resources
└───test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database hostname | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | payment_db |
| `DB_USER` | Database username | root |
| `DB_PASS` | Database password | — |
| `BOOKING_SERVICE_URL` | URL của Ticket Booking Service | http://ticket-booking-service:5000 |
| `RABBITMQ_HOST` | RabbitMQ hostname | rabbitmq |
| `RABBITMQ_PORT` | RabbitMQ port | 5672 |
| `RABBITMQ_USER` | RabbitMQ username | guest |
| `RABBITMQ_PASSWORD` | RabbitMQ password | guest |
