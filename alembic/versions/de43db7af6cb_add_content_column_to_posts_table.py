"""add content column to posts table

Revision ID: de43db7af6cb
Revises: ba05024fdd96
Create Date: 2026-07-31 16:52:17.798322

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'de43db7af6cb'
down_revision: Union[str, Sequence[str], None] = 'ba05024fdd96'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('posts', sa.Column('content', sa.String(), nullable=False))
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('posts')
    pass
