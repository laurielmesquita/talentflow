"""backfill missing tenant owners safely

Revision ID: 6c1d2e3f4a50
Revises: 5b8f3e2a1c70
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6c1d2e3f4a50"
down_revision: Union[str, Sequence[str], None] = "5b8f3e2a1c70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Repair only tenants that do not have an explicit owner yet."""
    op.execute(
        sa.text(
            """
            WITH eligible AS (
                SELECT
                    u.id,
                    u.tenant_id,
                    CASE
                        WHEN u.role = 'Manager' THEN 1
                        WHEN u.role = 'SuperAdmin'
                             AND COUNT(*) OVER (PARTITION BY u.tenant_id) = 1 THEN 2
                    END AS priority
                FROM users AS u
                WHERE u.is_active = true
                  AND u.role IN ('Manager', 'SuperAdmin')
            ), selected AS (
                SELECT DISTINCT ON (tenant_id) tenant_id, id
                FROM eligible
                WHERE priority IS NOT NULL
                ORDER BY tenant_id, priority, id
            )
            UPDATE tenants AS t
            SET owner_user_id = selected.id
            FROM selected
            WHERE t.id = selected.tenant_id
              AND t.owner_user_id IS NULL
            """
        )
    )


def downgrade() -> None:
    """Do not remove ownership data during a schema rollback."""
    pass
