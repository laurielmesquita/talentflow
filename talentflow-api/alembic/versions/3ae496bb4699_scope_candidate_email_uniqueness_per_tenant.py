"""scope_candidate_email_uniqueness_per_tenant

Restringe o indice parcial unico de candidates.email para ser composto por
(tenant_id, email). Antes deste patch, o indice `ix_candidates_email_active_unique`
era GLOBAL (nao-scoped), o que permitia enumeracao cross-tenant de e-mails de
candidatos: tentar cadastrar "candidato@x.com" no Tenant B falhava com erro de
duplicata se o mesmo e-mail ja existisse no Tenant A — revelando a presenca do
candidato em outro tenant (info-leak de pertenca multi-tenant).

Seguranca:
- Drop do indice global antigo.
- Cricao de novo indice parcial unico composto (tenant_id, email) com a mesma
  condicao (is_active=true AND deleted_at IS NULL AND email IS NOT NULL).
- Em producao, a remocao do indice antigo e segura: o indice nao e renomeado,
  apenas substituido.

Revision ID: 3ae496bb4699
Revises: 20db5e2e133f
Create Date: 2026-08-15 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '3ae496bb4699'
down_revision: Union[str, Sequence[str], None] = '20db5e2e133f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: substitui indice global por indice composto por tenant."""
    # O índice global pode não existir em bancos que receberam a correção
    # parcialmente ou foram provisionados a partir de um schema equivalente.
    # IF EXISTS torna a migração segura para esses estados sem remover dados.
    op.execute('DROP INDEX IF EXISTS ix_candidates_email_active_unique')
    op.execute('DROP INDEX IF EXISTS uq_candidate_tenant_email_active')
    op.create_index(
        'uq_candidate_tenant_email_active',
        'candidates',
        ['tenant_id', 'email'],
        unique=True,
        postgresql_where=op.f(
            "is_active = true AND deleted_at IS NULL AND email IS NOT NULL"
        ),
    )


def downgrade() -> None:
    """Downgrade schema: restaura indice global (nao recomendado)."""
    op.drop_index('uq_candidate_tenant_email_active', table_name='candidates')
    op.create_index(
        'ix_candidates_email_active_unique',
        'candidates',
        ['email'],
        unique=True,
        postgresql_where=op.f("is_active = true AND deleted_at IS NULL"),
    )
