"""add user table

Revision ID: e21e7c54c7e8
Revises: de43db7af6cb
Create Date: 2026-07-31 16:56:51.978618

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e21e7c54c7e8'
down_revision: Union[str, Sequence[str], None] = 'de43db7af6cb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
    sa.Column('email', sa.String(), nullable=False, unique=True, index=True),       
    sa.Column('password', sa.String(), nullable=False),
    sa.Column('is_active', sa.Boolean(), server_default='TRUE', nullable=False),
    sa.Column('created_at', sa.TIMESTAMP(timezone=True), nullable=False, server_default=sa.text('now()')))
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('users')
    pass
