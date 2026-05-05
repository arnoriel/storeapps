# Store App

Toko online single-brand dengan dashboard owner multi-cabang.

## Tech Stack
- **Backend:** FastAPI 0.115 + PostgreSQL 16 + Redis
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS

## Prerequisites
- Python 3.12+
- Node.js 20+
- pnpm 9+
- PostgreSQL 16
- Redis

## Run Backend

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # lalu isi nilainya
alembic upgrade head
uvicorn main:app --reload --port 8000
```

## Run Frontend

```bash
cd apps/web
npm install
cp .env.local.example .env.local  # lalu isi nilainya
npm dev
```