# Movie Service

## Overview

Movie Service là **Entity Service** chịu trách nhiệm quản lý danh mục phim, rạp chiếu phim và lịch chiếu (showtime) trong hệ thống đặt vé xem phim trực tuyến:

- **Business domain:** Quản lý phim & lịch chiếu — thông tin phim, rạp, suất chiếu
- **Operations:** Truy vấn danh sách phim đang/sắp chiếu, chi tiết phim, lịch chiếu theo phim

Service này được truy cập trực tiếp từ **Frontend** (qua API Gateway) để hiển thị danh sách phim và suất chiếu.

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
| GET | `/movies` | Lấy danh sách phim đang/sắp chiếu |
| GET | `/movies/{id}` | Lấy chi tiết phim theo ID |
| GET | `/movies/{id}/showtimes` | Lấy danh sách lịch chiếu theo phim |

> Full API specification: [`docs/api-specs/movie-service.yaml`](../../docs/api-specs/movie-service.yaml)

## Running Locally

```bash
# From project root
docker compose up movie-service --build
```

## Project Structure

```
src
├───main
│   ├───java
│   │   └───com
│   │       └───movie
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
| `DB_NAME` | Database name | movie_db |
| `DB_USER` | Database username | root |
| `DB_PASS` | Database password | — |
