import random
import string
from datetime import datetime, timezone


def generate_order_number() -> str:
    """Generate order number: ORD-YYYYMMDD-XXXX"""
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_suffix = "".join(
        random.choices(string.ascii_uppercase + string.digits, k=4)
    )
    return f"ORD-{date_str}-{random_suffix}"