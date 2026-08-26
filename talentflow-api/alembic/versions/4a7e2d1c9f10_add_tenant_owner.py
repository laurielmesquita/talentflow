"""add explicit tenant owner

Revision ID: 4a7e2d1c9f10
Revises: 3ae496bb4699
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "4a7e2d1c9f10"
down_revision: Union[str, Sequence[str], None] = "3ae496bb4699"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tenants", sa.Column("owner_user_id", sa.UUID(), nullable=True))
    op.create_index("ix_tenants_owner_user_id", "tenants", ["owner_user_id"], unique=False)
    op.create_foreign_key(
        "fk_tenants_owner_user_id", "tenants", "users", ["owner_user_id"], ["id"]
    )
    op.execute(
        sa.text(
            """
            UPDATE tenants AS t
            SET owner_user_id = first_manager.id
            FROM (
                SELECT DISTINCT ON (tenant_id) id, tenant_id
                FROM users
                WHERE role = 'Manager' AND is_active = true
                ORDER BY tenant_id, created_at ASC NULLS LAST, id ASC
            ) AS first_manager
            WHERE t.id = first_manager.tenant_id
            """
        )
    )


def downgrade() -> None:
    op.drop_constraint("fk_tenants_owner_user_id", "tenants", type_="foreignkey")
    op.drop_index("ix_tenants_owner_user_id", table_name="tenants")
    op.drop_column("tenants", "owner_user_id")
