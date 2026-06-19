import os
from sqlalchemy import create_engine, Column, Integer, String, Text, JSON, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# This absolute path logic is correct and should remain.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BACKEND_DIR, 'candidates.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Candidate(Base):
    __tablename__ = "candidates"
    
    # Existing fields
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)  # Made non-nullable with length
    # FIXED: Removed unique=True to allow multiple candidates without emails
    email = Column(String(255), index=True, nullable=True)  # Removed unique constraint
    phone = Column(String(50), nullable=True)  # Added length constraint
    resume_text = Column(Text, nullable=False)
    ai_metadata = Column(JSON, nullable=True)
    
    # Enhanced fields for better resume parsing
    job_role = Column(String(255), nullable=True, default="General")
    skills = Column(Text, nullable=True)  # JSON string of skills array
    experience_years = Column(Integer, default=0)
    education = Column(Text, nullable=True)
    match_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- ENHANCED DATABASE FUNCTIONS ---
def init_db():
    """Initialize database with all tables"""
    # This function will create all tables from your models.
    # It's safe to run multiple times; it won't recreate existing tables.
    Base.metadata.create_all(bind=engine)

def get_db():
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def reset_db():
    """Reset database - drop and recreate all tables"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def get_db_stats():
    """Get database statistics"""
    db = SessionLocal()
    try:
        total_candidates = db.query(Candidate).count()
        candidates_with_email = db.query(Candidate).filter(Candidate.email.isnot(None)).count()
        candidates_with_phone = db.query(Candidate).filter(Candidate.phone.isnot(None)).count()
        
        return {
            "total_candidates": total_candidates,
            "candidates_with_email": candidates_with_email,
            "candidates_with_phone": candidates_with_phone,
            "database_path": DATABASE_URL
        }
    finally:
        db.close()
