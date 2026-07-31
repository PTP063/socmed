"""add foreigm-key to posts table

Revision ID: 89ce2f375dcb
Revises: e21e7c54c7e8
Create Date: 2026-07-31 17:22:43.676975

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '89ce2f375dcb'
down_revision: Union[str, Sequence[str], None] = 'e21e7c54c7e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('owner_id', sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False))
    op.create_foreign_key  ('posts_users_fk', source_table='posts', referent_table='users', local_cols=['owner_id'], remote_cols=['id'], ondelete="CASCADE")
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('posts_users_fk', table_name='posts')
    op.drop_column('posts', 'owner_id')
    pass
