"""add email change requests and token versioning

Revision ID: 8e3f5a7b9c01
Revises: 7d2e4f6a8b90
"""

from alembic import op
import sqlalchemy as sa


revision = "8e3f5a7b9c01"
down_revision = "7d2e4f6a8b90"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("token_version", sa.Integer(), server_default="0", nullable=False))
    op.create_table(
        "email_change_requests",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("new_email", sa.String(), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_email_change_requests_user_id", "email_change_requests", ["user_id"])
    op.create_index("ix_email_change_requests_new_email", "email_change_requests", ["new_email"])
    op.create_index("ix_email_change_requests_token_hash", "email_change_requests", ["token_hash"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_email_change_requests_token_hash", table_name="email_change_requests")
    op.drop_index("ix_email_change_requests_new_email", table_name="email_change_requests")
    op.drop_index("ix_email_change_requests_user_id", table_name="email_change_requests")
    op.drop_table("email_change_requests")
    op.drop_column("users", "token_version")
