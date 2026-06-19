import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import reset_db, init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        logger.info("Resetting database with new schema...")
        reset_db()
        logger.info("Database reset complete!")
        logger.info("Initializing with new schema...")
        init_db()
        logger.info("Database initialization complete!")
        print("✅ Database successfully updated - UNIQUE constraint removed from email field")
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        print(f"❌ Error: {e}")
