# API Gateway

## Overview

The API Gateway serves as the single entry point for all client requests. It routes incoming requests to the appropriate backend microservice.

## Responsibilities

- **Request routing**: Forward requests to the correct service
- **Load balancing**: Distribute traffic (if applicable)
- **Authentication**: Validate tokens/credentials (optional)
- **Rate limiting**: Protect services from overload (optional)
- **CORS handling**: Allow frontend cross-origin requests
- **Request/Response transformation**: Modify headers, paths as needed

## Tech Stack

| Component  | Choice             |
|------------|--------------------|
| Approach   | *(e.g., Nginx, Express, FastAPI, Kong, Traefik)* |

## Routing Table

| External Path | Target Service | Internal URL |
|----------------------|----------------|--------------------------------|
| `/api/customers/*` | Customer Service | `http://customer-service:5000/customers/*` |
| `/api/movies/*` | Movie Service | `http://movie-service:5000/movies/*` |
| `/api/showtimes/*` | Seat Availability Service | `http://seat-availability-service:5000/showtimes/*` |
| `/api/bookings/*` | Ticket Booking Service | `http://ticket-booking-service:5000/bookings/*` |
| `/api/payments/*` | Payment Service | `http://payment-service:5000/payments/*` |
| `/api/notifications/*` | Notification Service | `http://notification-service:5000/notifications/*` |

## Running

```bash
# From project root
docker compose up gateway --build
```

## Configuration

The gateway uses Docker Compose networking. Services are accessible by their
service names defined in `docker-compose.yml` (e.g., `movie-service`, `payment-service`).

## Notes

- Use service names (not `localhost`) for upstream URLs inside Docker
- The gateway exposes port 8080 to the host
