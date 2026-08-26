"""add phone to users

Revision ID: 7d2e4f6a8b90
Revises: 6c1d2e3f4a50
"""

from alembic import op
import sqlalchemy as sa


revision = "7d2e4f6a8b90"
down_revision = "6c1d2e3f4a50"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone")
