# Hướng Dẫn Git Commit — Nguyễn Mạnh Cường (B22DCCN099)
> **Phụ trách:** Movie Service · Seat Availability Service · API Gateway (Nginx)

---

## Thiết lập git identity trước khi commit

```bash
git config user.name "Nguyen Manh Cuong"
git config user.email "cuong.b22dccn099@stu.ptit.edu.vn"
```

---

## Danh Sách Commit

---

**Commit 1** — Khởi tạo 2 service và API Gateway
```bash
git add services/movie-service/pom.xml services/movie-service/Dockerfile services/movie-service/src/
git add services/seat-availability-service/pom.xml services/seat-availability-service/Dockerfile services/seat-availability-service/src/
git add gateway/nginx.conf gateway/Dockerfile
git commit -m "feat: khởi tạo movie-service, seat-availability-service và cấu hình Nginx API Gateway"
```
> Tạo Spring Boot project cho movie-service (quản lý phim/rạp/lịch chiếu) và seat-availability-service (quản lý trạng thái ghế AVAILABLE/HELD/SOLD). Cấu hình Nginx routing `/api/movies/*` và `/api/showtimes/*` đến đúng service, xử lý CORS preflight.

---

**Commit 2** — OpenAPI specs
```bash
git add docs/api-specs/movie-service.yaml
git add docs/api-specs/seat-availability-service.yaml
git commit -m "docs(api-spec): thêm OpenAPI 3.0 spec cho Movie Service và Seat Availability Service"
```
> Định nghĩa đầy đủ endpoints, request/response schema, error codes cho 2 service. Seat spec mô tả rõ state machine ghế: AVAILABLE → HELD → SOLD, xử lý 409 Conflict khi ghế đang bị giữ bởi booking khác.

---

**Commit 3** — Implement Movie Service hoàn chỉnh
```bash
git add services/movie-service/src/main/java/com/movie/
git add services/movie-service/src/main/resources/data.sql
git commit -m "feat(movie-service): implement Entity, Repository, Service, Controller và seed data phim/rạp/lịch chiếu"
```
> Tạo JPA Entity Movie, Theater, Showtime. Repository với custom queries. Service layer trả DTO (không expose Entity). Controller expose `GET /movies`, `GET /movies/{id}`, `GET /movies/{id}/showtimes`, `GET /health`. Seed 5 phim, 3 rạp, 20 suất chiếu mẫu.

---

**Commit 4** — Implement Seat Availability Service hoàn chỉnh
```bash
git add services/seat-availability-service/src/main/java/com/seat/
git add services/seat-availability-service/src/main/resources/data.sql
git commit -m "feat(seat-service): implement seat state machine hold/release/sold với optimistic locking"
```
> Entity Seat với field status (enum), JPA `@Version` tránh race condition khi 2 user chọn cùng ghế. Controller expose `GET /showtimes/{id}/seats`, `POST /seats/{id}/hold`, `/release`, `/sold`. Seed 50 ghế mẫu ở trạng thái AVAILABLE.

---

**Commit 5** — Tài liệu phân tích kiến trúc
```bash
git add docs/architecture.md
git add docs/analysis-and-design.md
git commit -m "docs: hoàn thiện architecture.md (pattern selection, component table) và phần Movie/Seat trong analysis"
```
> Điền Pattern Selection (API Gateway, Database per Service, Event-driven, Cache-aside Redis, Idempotency Key). Communication matrix chi tiết. Phần phân tích Actor/Action/Entity Service Candidates cho Movie Service và Seat Availability Service.

---

**Commit 6** — Readme service và cập nhật gateway
```bash
git add services/movie-service/readme.md
git add services/seat-availability-service/readme.md
git add gateway/readme.md
git commit -m "docs: thêm readme cho movie-service, seat-availability-service và gateway"
```
> Mỗi readme gồm Overview, Tech Stack, API Endpoints, Project Structure, Environment Variables. Gateway readme có routing table đầy đủ 6 services.

---

## Thứ Tự Luân Phiên (xem file commit-guide-nam.md)
