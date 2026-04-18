# Notification Service

## Overview

Notification Service là **Utility Service** chịu trách nhiệm gửi thông báo bất đồng bộ đến người dùng cuối sau các sự kiện quan trọng trong luồng đặt vé xem phim:

- **Business domain:** Thông báo hệ thống — email xác nhận vé, thông báo thất bại thanh toán
- **Operations:** Nhận event từ RabbitMQ (Inbox Pattern) → gửi email → ghi log kết quả

Service này hoàn toàn **async** — không chặn luồng phản hồi chính, được kích hoạt bởi các event:
- `ticket.created` → gửi email vé + QR cho khách hàng
- `booking.failed` → gửi email thông báo thất bại

## Tech Stack

| Component | Choice |
|-----------|--------|
| Language | Java |
| Framework | Spring Boot |
| Message Broker | RabbitMQ (Inbox Pattern) |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

> Full API specification: [`docs/api-specs/notification-service.yaml`](../../docs/api-specs/notification-service.yaml)

## Event Subscriptions (RabbitMQ)

| Event | Hành động |
|-------|-----------|
| `ticket.created` | Gửi email vé + QR code đến khách hàng |
| `booking.failed` | Gửi email thông báo đặt vé thất bại |

## Running Locally

```bash
# From project root
docker compose up notification-service --build
```

## Project Structure

```
src
├───main
│   ├───java
│   │   └───com
│   │       └───notification
│   │           ├───config
│   │           ├───consumer     # RabbitMQ Inbox consumer
│   │           ├───controller   # REST health endpoints
│   │           ├───dto
│   │           ├───exception
│   │           └───service      # Business logic gửi thông báo
│   └───resources
│       └───templates            # Email templates (HTML)
└───test
    ├───java
    │   └───com
    │       └───notification
    │           ├───consumer
    │           ├───notification_service
    │           └───service
    └───resources
        └───mockito-extensions
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RABBITMQ_HOST` | RabbitMQ hostname | rabbitmq |
| `RABBITMQ_PORT` | RabbitMQ port | 5672 |
| `RABBITMQ_USER` | RabbitMQ username | guest |
| `RABBITMQ_PASSWORD` | RabbitMQ password | guest |
| `SPRING_MAIL_USERNAME` | SMTP username / email gửi | — |
| `SPRING_MAIL_PASSWORD` | SMTP password / app password | — |
