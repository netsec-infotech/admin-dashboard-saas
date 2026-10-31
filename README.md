# Evegah SaaS Platform

Pixel-perfect recreation of the Evegah Employee Dashboard.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Backend | Node.js + Express |
| Database | PostgreSQL 16 |
| Charts | Chart.js + react-chartjs-2 |

---

## Project Structure
```
Evegah SaaS - Final/
├── frontend/          # Next.js 16 App Router
│   ├── src/
│   │   ├── app/           # Pages & layouts
│   │   └── components/    # All UI components
│   └── .env.local
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── db/            # PostgreSQL pool + migrations + seeds
│   │   └── routes/        # API routes
│   └── .env
└── docker-compose.yml # PostgreSQL + pgAdmin
```

---

## Quick Start

### 1. Start PostgreSQL (requires Docker)
```bash
docker compose up -d
```

### 2. Run Backend
```bash
cd backend
npm install
npm run migrate   # Create tables
npm run seed      # Seed demo data
npm run dev       # Start on :5000
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev       # Start on :3000
```

### 4. Open Dashboard
→ **http://localhost:3000**

---

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard stat cards |
| GET | `/api/requests?page=1&limit=5` | Paginated requests |
| GET | `/api/requests/status-summary` | Donut chart data |
| GET | `/api/today-summary` | Today's summary panel |
| GET | `/api/knowledge` | Knowledge resources |

---

## Database (PostgreSQL)
- **Host**: localhost:5432
- **DB**: evegah_db
- **User**: evegah_user / Pass: evegah_pass
- **pgAdmin**: http://localhost:5050 (admin@evegah.com / admin123)

---

## Components
| Component | Description |
|-----------|-------------|
| `Sidebar` | Fixed left nav with all menu items |
| `TopBar` | Sticky header with search + user profile |
| `StatCards` | 4 metric cards with SVG sparklines |
| `CreateNewRequest` | 5 request type action cards |
| `RecentRequestsTable` | Data table with pagination |
| `TodaysSummary` | Right panel daily metrics |
| `RequestStatusDonut` | Chart.js doughnut chart |
| `KnowledgeResources` | Right panel resource links |
| `FooterNotification` | Fixed bottom warning bar |
