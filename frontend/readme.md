# Frontend

## Overview

This is the frontend module of the microservices system. It provides the user interface and communicates with backend services through the API Gateway.

## Tech Stack

| Component        | Choice               |
|------------------|----------------------|
| Framework        | React |
| Styling          | CSS |
| Package Manager  | npm |
| Build Tool       | Vite |

## Getting Started

```bash
# From project root
docker compose up frontend --build

# Or run locally
npm install
npm run dev
```

## Project Structure

```
frontend/
├── Dockerfile
├── package.json
├── index.html
├── readme.md
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Environment Variables

| Variable       | Description                | Default                  |
|----------------|----------------------------|--------------------------|
| `VITE_API_BASE_URL` | URL of the API Gateway | `http://localhost:8081`  |

## Build for Production

```bash
npm run build
```

## Notes

- All API calls should go through the **API Gateway** (`gateway`), not directly to individual services.
- Configure proxy or API base URL to point to the gateway.