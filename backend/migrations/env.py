# backend/migrations/env.py
import sys
from os.path import abspath, dirname

# Add project root to Python path
sys.path.insert(0, dirname(dirname(dirname(abspath(__file__)))))  # Changed to 3 dirnames

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from backend.database import Base  # Keep this import

config = context.config
fileConfig(config.config_file_name)
target_metadata = Base.metadata

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target metadata to your Base class
target_metadata = Base.metadata  # Changed from None

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
