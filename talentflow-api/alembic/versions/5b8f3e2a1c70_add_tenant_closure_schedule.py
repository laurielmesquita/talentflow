"""add tenant closure schedule

Revision ID: 5b8f3e2a1c70
Revises: 4a7e2d1c9f10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5b8f3e2a1c70"
down_revision: Union[str, Sequence[str], None] = "4a7e2d1c9f10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tenants", sa.Column("closure_status", sa.String(), server_default="active", nullable=False))
    op.add_column("tenants", sa.Column("closure_requested_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("tenants", sa.Column("closure_scheduled_for", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("tenants", "closure_scheduled_for")
    op.drop_column("tenants", "closure_requested_at")
    op.drop_column("tenants", "closure_status")
