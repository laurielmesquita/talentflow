"""add_tenant_and_multi_tenancy

Revision ID: f7fafd77c98b
Revises: c9c1a5bcdb71
Create Date: 2026-06-21 03:50:10.871056

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7fafd77c98b'
down_revision: Union[str, Sequence[str], None] = 'c9c1a5bcdb71'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


import uuid

def upgrade() -> None:
    # 1. Create tenants table
    op.create_table('tenants',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True)
    )

    # 2. Insert default tenant
    # Using a generated UUID to be safe, though 00000000-0000-0000-0000-000000000000 is also fine.
    default_tenant_id = str(uuid.uuid4())
    op.execute(f"INSERT INTO tenants (id, name, created_at) VALUES ('{default_tenant_id}', 'TalentFlow Default', now())")

    tables = ['users', 'candidates', 'job_positions', 'categories', 'skills', 'batch_jobs', 'invites']

    # 3. Add tenant_id to tables (nullable initially)
    for table in tables:
        op.add_column(table, sa.Column('tenant_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
        
        # 4. Update existing rows
        op.execute(f"UPDATE {table} SET tenant_id = '{default_tenant_id}' WHERE tenant_id IS NULL")
        
        # 5. Make non-nullable
        op.alter_column(table, 'tenant_id', nullable=False)
        
        # 6. Add foreign key constraint
        op.create_foreign_key(f"fk_{table}_tenant_id", table, 'tenants', ['tenant_id'], ['id'])


def downgrade() -> None:
    tables = ['invites', 'batch_jobs', 'skills', 'categories', 'job_positions', 'candidates', 'users']
    for table in tables:
        op.drop_constraint(f"fk_{table}_tenant_id", table, type_='foreignkey')
        op.drop_column(table, 'tenant_id')
    op.drop_table('tenants')
