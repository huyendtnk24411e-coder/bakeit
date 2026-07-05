import json
import random
import os

ROOT = os.path.dirname(os.path.dirname(__file__))
OUT_PATH = os.path.join(ROOT, 'data', 'products_300.json')

brands = [
    "Baker Choice", "Anchor", "Saf-Instant", "Beemart", "Meizan", "Mikko",
    "Westgold", "Vinamilk", "Kewpie", "Nestle", "Orion", "DaVinci",
    "Hachi", "Sunrise", "HappyBake", "LaFleur", "Prima", "Chef's Pride",
    "GoldenFarm", "Royal"
]

categories = [
    ("nguyen-lieu", ["bot-mi", "bo-sua", "men-phu-gia"]),
    ("set-co-san", ["set-cookies", "set-banh", "set-kem"]),
    ("do-dung", ["phu-kien", "dao-cu", "khay-nuong"])
]

def gen_title(brand, sub, i):
    return f"{brand} {sub} #{i}"

def gen_price(i):
    base = 18000
    return base + (i * 250) % 200000

def gen_image(i):
    return f"https://via.placeholder.com/300?text=Product+{i}"

products = []
for i in range(1, 301):
    cat, subs = random.choice(categories)
    sub = random.choice(subs)
    brand = random.choice(brands)
    prod = {
        "title": gen_title(brand, sub, i),
        "price": gen_price(i),
        "image": gen_image(i),
        "category": cat,
        "subCategory": sub,
        "brand": brand,
        "inStock": random.random() > 0.15,
        "isBestSeller": random.random() > 0.9
    }
    products.append(prod)

os.makedirs(os.path.join(ROOT, 'data'), exist_ok=True)
with open(OUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(products)} products to {OUT_PATH}")
