import os
import sqlite3
from database import init_db, BACKEND_DIR, DATABASE_URL

def migrate_database():
    """Migrate existing database to new schema"""
    db_path = os.path.join(BACKEND_DIR, 'candidates.db')
    
    print(f"Checking database at: {db_path}")
    
    if os.path.exists(db_path):
        print("Existing database found. Adding new columns...")
        
        # Connect directly to SQLite to add columns
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get current table structure
        cursor.execute("PRAGMA table_info(candidates);")
        existing_columns = [column[1] for column in cursor.fetchall()]
        print(f"Existing columns: {existing_columns}")
        
        # Add new columns if they don't exist
        new_columns = [
            ("job_role", "VARCHAR(255) DEFAULT 'General'"),
            ("skills", "TEXT"),
            ("experience_years", "INTEGER DEFAULT 0"),
            ("education", "TEXT"),
            ("match_score", "REAL DEFAULT 0.0"),
            ("created_at", "DATETIME")
        ]
        
        for column_name, column_type in new_columns:
            if column_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE candidates ADD COLUMN {column_name} {column_type}")
                    print(f"Added column: {column_name}")
                except sqlite3.OperationalError as e:
                    print(f"Column {column_name} might already exist: {e}")
        
        conn.commit()
        conn.close()
        print("Database migration completed!")
    else:
        print("No existing database found. Creating new database...")
        init_db()
        print("New database created!")

if __name__ == "__main__":
    migrate_database()
