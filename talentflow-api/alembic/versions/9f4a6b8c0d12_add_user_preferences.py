"""add user preferences

Revision ID: 9f4a6b8c0d12
Revises: 8e3f5a7b9c01
"""

from alembic import op
import sqlalchemy as sa


revision = "9f4a6b8c0d12"
down_revision = "8e3f5a7b9c01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("timezone", sa.String(), server_default="America/Sao_Paulo", nullable=False))
    op.add_column("users", sa.Column("email_notifications", sa.Boolean(), server_default="true", nullable=False))
    op.add_column("users", sa.Column("theme", sa.String(), server_default="system", nullable=False))


def downgrade() -> None:
    op.drop_column("users", "theme")
    op.drop_column("users", "email_notifications")
    op.drop_column("users", "timezone")
