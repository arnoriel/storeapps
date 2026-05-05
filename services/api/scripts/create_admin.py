"""
Script untuk membuat user ADMIN pertama.
Jalankan: python scripts/create_admin.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from core.database import AsyncSessionLocal
from core.security import hash_password
from models.user import User


async def create_admin(username: str, password: str) -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == username))
        existing = result.scalar_one_or_none()

        if existing:
            print(f"❌ Username '{username}' sudah ada.")
            return

        admin = User(
            username=username,
            password_hash=hash_password(password),
            role="ADMIN",
        )
        db.add(admin)
        await db.commit()
        print(f"✅ Admin '{username}' berhasil dibuat.")


if __name__ == "__main__":
    username = input("Username admin: ").strip()
    password = input("Password admin: ").strip()

    if not username or not password:
        print("❌ Username dan password tidak boleh kosong.")
        sys.exit(1)

    asyncio.run(create_admin(username, password))