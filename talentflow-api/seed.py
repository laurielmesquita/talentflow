import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.domain import Category

def seed_categories():
    db = SessionLocal()
    categories = [
        "Atendimento",
        "Estoque",
        "Técnico",
        "Administração",
        "Serviços Gerais"
    ]
    
    for cat_name in categories:
        existing = db.query(Category).filter(Category.name == cat_name).first()
        if not existing:
            new_cat = Category(name=cat_name)
            db.add(new_cat)
            print(f"Categoria criada: {cat_name}")
    
    db.commit()
    db.close()
    print("Seed finalizado!")

if __name__ == "__main__":
    seed_categories()
