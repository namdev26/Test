# Customer Service

## Overview

Customer Service là **Entity Service** chịu trách nhiệm quản lý thông tin hồ sơ khách hàng trong hệ thống đặt vé xem phim trực tuyến:

- **Business domain:** Quản lý khách hàng — hồ sơ cá nhân, tra cứu theo email
- **Operations:** Tạo mới khách hàng, tra cứu theo ID hoặc email, phục vụ Ticket Booking Service resolve/tạo customer trước khi đặt vé

Service này được gọi đồng bộ (HTTP sync) bởi **Ticket Booking Service** trong luồng tạo booking.

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
| POST | `/customers` | Tạo mới khách hàng |
| GET | `/customers/{id}` | Lấy thông tin khách hàng theo ID |
| GET | `/customers/by-email` | Tra cứu khách hàng theo email |

> Full API specification: [`docs/api-specs/customer-service.yaml`](../../docs/api-specs/customer-service.yaml)

## Running Locally

```bash
# From project root
docker compose up customer-service --build
```

## Project Structure

```
src
├───main
│   ├───java
│   │   └───com
│   │       └───customer
│   │           ├───controller   # REST endpoints
│   │           ├───dto
│   │           ├───exception
│   │           ├───model
│   │           ├───repository
│   │           └───service      # Business logic
│   └───resources
└───test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database hostname | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | customer_db |
| `DB_USER` | Database username | root |
| `DB_PASS` | Database password | — |
