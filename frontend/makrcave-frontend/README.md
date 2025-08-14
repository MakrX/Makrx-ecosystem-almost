# MakrCave Frontend

A React + Vite application for makerspace management, covering inventory, equipment reservations, projects, and analytics.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
cd frontend/makrcave-frontend
cp .env.example .env
npm install
npm run dev
```
Copy `.env.example` to `.env` and update values as needed.

The dev server runs on [http://localhost:3001](http://localhost:3001).

### Mock API Server

For local development, a mock API server can be started separately:

```bash
npm run mock-api
```

The server listens on [http://localhost:8000](http://localhost:8000) and accepts only test accounts:

- `superadmin@makrcave.com` / `SuperAdmin2024!`
- `admin@makrcave.com` / `Admin2024!`
- `manager@makrcave.com` / `Manager2024!`
- `provider@makrcave.com` / `Provider2024!`
- `user@makrcave.com` / `User2024!`

These credentials are fake and should never be used with real services. Run `npm run dev:with-api` to launch both the mock API and the frontend together.

## Available Scripts
- `npm run dev` – start Vite development server
- `npm run dev:with-api` – dev server with backend proxy
- `npm run mock-api` – run local mock API
- `npm run build` – create production build
- `npm run preview` / `npm start` – preview built app
- `npm run lint` / `npm run lint:fix` – lint code
- `npm test` – run unit tests
- `npm run typecheck` – TypeScript checks

## Deployment
1. Build the app:
   ```bash
   npm run build
   ```
2. Serve the `dist/` directory with any static server or Docker:
   ```bash
   docker build -t makrcave-frontend .
   docker run -p 3001:80 makrcave-frontend
   ```

For the full system architecture see the [MakrX architecture overview](../../docs/ARCHITECTURE.md).
