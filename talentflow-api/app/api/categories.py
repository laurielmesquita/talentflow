from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import SessionLocal
from app.models.domain import Category, candidate_category, User

from app.api.deps import get_current_user
router = APIRouter(dependencies=[Depends(get_current_user)])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CategoryCreate(BaseModel):
    name: str

class CategoryUpdate(BaseModel):
    name: str

@router.get("/categories")
def list_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cats = db.query(Category).filter(Category.tenant_id == current_user.tenant_id).order_by(Category.name.asc()).all()
    return [{"id": str(c.id), "name": c.name} for c in cats]

@router.post("/categories")
def create_category(cat: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    name_clean = cat.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="O nome da categoria não pode ser vazio")
        
    existing = db.query(Category).filter(Category.name.ilike(name_clean), Category.tenant_id == current_user.tenant_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Esta categoria já existe")
        
    db_cat = Category(name=name_clean, tenant_id=current_user.tenant_id)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return {"id": str(db_cat.id), "name": db_cat.name}

@router.put("/categories/{category_id}")
def update_category(category_id: str, cat: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cat = db.query(Category).filter(Category.id == category_id, Category.tenant_id == current_user.tenant_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
    name_clean = cat.name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="O nome da categoria não pode ser vazio")
        
    existing = db.query(Category).filter(Category.name.ilike(name_clean), Category.id != category_id, Category.tenant_id == current_user.tenant_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Já existe outra categoria com este nome")
        
    db_cat.name = name_clean
    db.commit()
    db.refresh(db_cat)
    return {"id": str(db_cat.id), "name": db_cat.name}

@router.delete("/categories/{category_id}", status_code=204)
def delete_category(category_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cat = db.query(Category).filter(Category.id == category_id, Category.tenant_id == current_user.tenant_id).first()
    if not db_cat:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
        
    # Delete associations in candidate_category many-to-many table
    db.execute(candidate_category.delete().where(candidate_category.c.category_id == category_id))
    
    db.delete(db_cat)
    db.commit()
    return
