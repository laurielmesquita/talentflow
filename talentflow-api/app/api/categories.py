from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.domain import Category

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).all()
    return [{"id": str(c.id), "name": c.name} for c in cats]
