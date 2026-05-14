# Store App

Toko online single-brand dengan dashboard owner multi-cabang.

## Tech Stack
- **Backend:** FastAPI 0.115 + PostgreSQL 16 + Redis
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS

## Prerequisites
- Python 3.12+
- Node.js 20+
- npm 9+
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

## Demo Data Seeder

Untuk mengisi database dengan data demo:

```bash
cd services/api
source .venv/bin/activate
python scripts/seed_demo_data.py
```

> ⚠️ **WARNING:** Script ini akan menghapus semua data existing dan mengisi ulang dengan data demo.

### Akun yang dibuat:
| Role    | Username    | Password   |
|---------|-------------|------------|
| ADMIN   | admin       | admin123   |
| BRANCH  | cabang_bdg  | branch123  |
| BRANCH  | cabang_jkt  | branch123  |

### Data yang dibuat:
- 10 produk demo (1 stok habis untuk testing)
- 5 order dengan berbagai status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED)
- Store location: Bandung (origin pengiriman)