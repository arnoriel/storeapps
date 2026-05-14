"""
Script seed data demo untuk template client baru.
Jalankan: python scripts/seed_demo_data.py

WARNING: Script ini akan menghapus semua data existing!
Gunakan hanya untuk setup awal / demo environment.
"""

import asyncio
import sys
import os
import random
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete
from core.database import AsyncSessionLocal
from core.security import hash_password
from models.user import User
from models.product import Product
from models.order import Order
from services.order_service import generate_order_number


# ─── Demo Data ─────────────────────────────────────────────────────────────────

DEMO_USERS = [
    {
        "username": "admin",
        "password": "admin123",
        "role": "ADMIN",
        "store_location": {"lat": -6.9147, "lng": 107.6098},
        "store_address": "Jl. Asia Afrika No. 1, Bandung, Jawa Barat",
    },
    {
        "username": "cabang_bdg",
        "password": "branch123",
        "role": "BRANCH",
        "store_location": {"lat": -6.9175, "lng": 107.6191},
        "store_address": "Jl. Braga No. 10, Bandung",
    },
    {
        "username": "cabang_jkt",
        "password": "branch123",
        "role": "BRANCH",
        "store_location": {"lat": -6.2088, "lng": 106.8456},
        "store_address": "Jl. Sudirman No. 5, Jakarta Pusat",
    },
]

DEMO_PRODUCTS = [
    {
        "product_name": "Kaos Polos Premium",
        "product_description": "Kaos berkualitas tinggi dari bahan cotton combed 30s, nyaman dipakai sehari-hari.",
        "price": 85000,
        "stock": 50,
        "weight_grams": 200,
        "image_url": "https://picsum.photos/seed/kaos/400/400",
    },
    {
        "product_name": "Kemeja Flannel",
        "product_description": "Kemeja flannel motif kotak-kotak, cocok untuk casual maupun semi-formal.",
        "price": 185000,
        "stock": 30,
        "weight_grams": 350,
        "image_url": "https://picsum.photos/seed/kemeja/400/400",
    },
    {
        "product_name": "Celana Chino Slim Fit",
        "product_description": "Celana chino bahan stretch, nyaman bergerak dan tetap stylish.",
        "price": 225000,
        "stock": 25,
        "weight_grams": 500,
        "image_url": "https://picsum.photos/seed/celana/400/400",
    },
    {
        "product_name": "Jaket Hoodie Fleece",
        "product_description": "Jaket hoodie berbahan fleece tebal, hangat untuk cuaca dingin.",
        "price": 295000,
        "stock": 20,
        "weight_grams": 600,
        "image_url": "https://picsum.photos/seed/jaket/400/400",
    },
    {
        "product_name": "Sepatu Sneakers Canvas",
        "product_description": "Sepatu sneakers kanvas ringan dan tahan lama, tersedia berbagai ukuran.",
        "price": 350000,
        "stock": 15,
        "weight_grams": 800,
        "image_url": "https://picsum.photos/seed/sepatu/400/400",
    },
    {
        "product_name": "Topi Baseball Cap",
        "product_description": "Topi baseball dengan bordir premium, adjustable untuk semua ukuran kepala.",
        "price": 95000,
        "stock": 40,
        "weight_grams": 150,
        "image_url": "https://picsum.photos/seed/topi/400/400",
    },
    {
        "product_name": "Tas Selempang Mini",
        "product_description": "Tas selempang minimalis untuk kebutuhan harian, bahan kulit sintetis berkualitas.",
        "price": 175000,
        "stock": 18,
        "weight_grams": 400,
        "image_url": "https://picsum.photos/seed/tas/400/400",
    },
    {
        "product_name": "Dompet Kulit Slim",
        "product_description": "Dompet kulit asli tipis dan elegan, muat kartu dan uang kertas.",
        "price": 145000,
        "stock": 35,
        "weight_grams": 120,
        "image_url": "https://picsum.photos/seed/dompet/400/400",
    },
    {
        "product_name": "Ikat Pinggang Anyam",
        "product_description": "Ikat pinggang anyam premium, cocok untuk casual dan semi-formal.",
        "price": 75000,
        "stock": 45,
        "weight_grams": 200,
        "image_url": "https://picsum.photos/seed/belt/400/400",
    },
    {
        "product_name": "Kacamata Sunglasses",
        "product_description": "Kacamata hitam UV400 protection, frame ringan dan tahan lama.",
        "price": 125000,
        "stock": 0,  # Sengaja stok habis untuk demo
        "weight_grams": 100,
        "image_url": "https://picsum.photos/seed/kacamata/400/400",
    },
]

DEMO_CUSTOMERS = [
    {
        "customer_name": "Budi Santoso",
        "customer_phone": "081234567890",
        "customer_email": "budi@example.com",
        "customer_address": "Jl. Merdeka No. 5, Bandung",
        "customer_location": {"lat": -6.9200, "lng": 107.6050},
    },
    {
        "customer_name": "Siti Rahayu",
        "customer_phone": "082345678901",
        "customer_email": "siti@example.com",
        "customer_address": "Jl. Pahlawan No. 12, Jakarta",
        "customer_location": {"lat": -6.2100, "lng": 106.8500},
    },
    {
        "customer_name": "Ahmad Fauzi",
        "customer_phone": "083456789012",
        "customer_email": "ahmad@example.com",
        "customer_address": "Jl. Diponegoro No. 8, Surabaya",
        "customer_location": {"lat": -7.2575, "lng": 112.7521},
    },
    {
        "customer_name": "Dewi Lestari",
        "customer_phone": "084567890123",
        "customer_email": "dewi@example.com",
        "customer_address": "Jl. Gajah Mada No. 3, Yogyakarta",
        "customer_location": {"lat": -7.7956, "lng": 110.3695},
    },
    {
        "customer_name": "Rizki Pratama",
        "customer_phone": "085678901234",
        "customer_email": "rizki@example.com",
        "customer_address": "Jl. Ahmad Yani No. 20, Medan",
        "customer_location": {"lat": 3.5952, "lng": 98.6722},
    },
]


async def seed():
    print("🌱 Starting demo data seed...")
    print("⚠️  WARNING: This will delete all existing data!")

    confirm = input("Type 'yes' to continue: ").strip()
    if confirm != "yes":
        print("❌ Cancelled.")
        return

    async with AsyncSessionLocal() as db:
        # ── Clear existing data ─────────────────────────────────────────
        print("\n🗑️  Clearing existing data...")
        await db.execute(delete(Order))
        await db.execute(delete(Product))
        await db.execute(delete(User))
        await db.commit()
        print("   ✓ Cleared orders, products, users")

        # ── Seed Users ──────────────────────────────────────────────────
        print("\n👤 Creating users...")
        created_users = []
        for u in DEMO_USERS:
            user = User(
                username=u["username"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                store_location=u.get("store_location"),
                store_address=u.get("store_address"),
            )
            db.add(user)
            created_users.append(user)

        await db.flush()
        admin_user = next(u for u in created_users if u.role == "ADMIN")
        branch_users = [u for u in created_users if u.role == "BRANCH"]
        print(f"   ✓ Created {len(created_users)} users")
        print(f"   → Admin: admin / admin123")
        print(f"   → Branch: cabang_bdg / branch123")
        print(f"   → Branch: cabang_jkt / branch123")

        # ── Seed Products ───────────────────────────────────────────────
        print("\n📦 Creating products...")
        created_products = []
        for p in DEMO_PRODUCTS:
            product = Product(
                product_name=p["product_name"],
                product_description=p["product_description"],
                price=p["price"],
                stock=p["stock"],
                weight_grams=p["weight_grams"],
                image_url=p["image_url"],
                is_active=True,
            )
            db.add(product)
            created_products.append(product)

        await db.flush()
        print(f"   ✓ Created {len(created_products)} products")

        # ── Seed Orders ─────────────────────────────────────────────────
        print("\n🛍️  Creating orders...")

        order_configs = [
            {
                "order_status": "DELIVERED",
                "paid_status": "PAID",
                "days_ago": 20,
                "handler": branch_users[0],
            },
            {
                "order_status": "SHIPPED",
                "paid_status": "PAID",
                "days_ago": 10,
                "handler": branch_users[1],
            },
            {
                "order_status": "PROCESSING",
                "paid_status": "PAID",
                "days_ago": 5,
                "handler": branch_users[0],
            },
            {
                "order_status": "CONFIRMED",
                "paid_status": "PAID",
                "days_ago": 2,
                "handler": None,  # Belum di-claim
            },
            {
                "order_status": "PENDING",
                "paid_status": "UNPAID",
                "days_ago": 0,
                "handler": None,
            },
        ]

        total_omzet = 0.0
        paid_orders_count = 0

        for i, config in enumerate(order_configs):
            customer = DEMO_CUSTOMERS[i]
            product = created_products[i % len(created_products)]
            shipping_cost = random.choice([13000, 15000, 18000, 25000])
            total_amount = float(product.price) + shipping_cost

            created_at = datetime.now(timezone.utc) - timedelta(days=config["days_ago"])

            order = Order(
                order_number=generate_order_number(),
                product_id=product.id,
                quantity=1,
                customer_name=customer["customer_name"],
                customer_phone=customer["customer_phone"],
                customer_email=customer["customer_email"],
                customer_address=customer["customer_address"],
                customer_location=customer["customer_location"],
                shipping_cost=shipping_cost,
                shipping_courier=random.choice(["JNE REG", "J&T REG", "SiCepat REG"]),
                total_amount=total_amount,
                order_status=config["order_status"],
                paid_status=config["paid_status"],
                handled_by_id=config["handler"].id if config["handler"] else None,
                hitpay_payment_id=f"demo-{i+1}",
                hitpay_payment_url=f"https://example.com/pay/demo-{i+1}",
                created_at=created_at,
                updated_at=created_at,
            )
            db.add(order)

            if config["paid_status"] == "PAID":
                total_omzet += total_amount
                paid_orders_count += 1

        # Update omzet admin
        admin_user.omzet_totals = total_omzet
        admin_user.orders_count = paid_orders_count

        await db.commit()
        print(f"   ✓ Created {len(order_configs)} orders")
        print(f"   → DELIVERED: 1, SHIPPED: 1, PROCESSING: 1, CONFIRMED: 1, PENDING: 1")

    print("\n✅ Seed completed!")
    print("\n📋 Login credentials:")
    print("   Admin    : admin / admin123")
    print("   Branch 1 : cabang_bdg / branch123")
    print("   Branch 2 : cabang_jkt / branch123")


if __name__ == "__main__":
    asyncio.run(seed())