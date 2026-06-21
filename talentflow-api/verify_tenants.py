import os
import sys

# Change to the api directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.domain import Tenant, User, Candidate, Category, JobPosition

def verify_tenants():
    db = SessionLocal()
    try:
        tenants = db.query(Tenant).all()
        print(f"Tenants: {len(tenants)}")
        for t in tenants:
            print(f"- {t.name} ({t.id})")

        users = db.query(User).all()
        print(f"\nUsers: {len(users)}")
        for u in users:
            print(f"- {u.email} -> Tenant: {u.tenant_id}")

        candidates = db.query(Candidate).all()
        print(f"\nCandidates: {len(candidates)}")
        for c in candidates:
            print(f"- {c.full_name} -> Tenant: {c.tenant_id}")

        print("\nAll good!")
    finally:
        db.close()

if __name__ == "__main__":
    verify_tenants()
