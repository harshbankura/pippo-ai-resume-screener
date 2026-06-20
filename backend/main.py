from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from candidate_router import router as candidate_router, upload_resume, get_db
from database import init_db
import logging
import os
from contextlib import asynccontextmanager

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("main")

# Suppress external library warnings
try:
    from transformers import logging as tf_logging
    tf_logging.set_verbosity_error()
except ImportError:
    logger.info("Transformers not installed - skipping warning suppression")

# --- ENHANCED STARTUP/SHUTDOWN LOGIC ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting PIPPO Resume Analysis API...")
    try:
        logger.info("Database initialization started...")
        init_db()
        logger.info("Database initialization complete.")
        logger.info("Resume parsing modules loading...")
        # Pre-load any heavy AI models here if needed
        logger.info("API startup complete.")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise e
    
    yield
    
    # Shutdown
    logger.info("Shutting down PIPPO Resume Analysis API...")

# Create FastAPI app with enhanced configuration
app = FastAPI(
    title="PIPPO Resume Analysis API",
    description="AI-powered resume parsing and candidate matching system",
    version="1.2.0-enhanced",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enhanced CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with prefix for better API organization
app.include_router(candidate_router, prefix="/api/v1", tags=["candidates"])

# FIXED: Add the missing upload endpoints that your frontend expects
@app.post("/api/v1/upload-resume/", tags=["candidates"])
async def upload_resume_legacy(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    job_role: str = Form("Unassigned"),
    db = Depends(get_db)
):
    """Legacy upload endpoint for compatibility"""
    logger.info(f"Legacy upload request received: {file.filename}")
    return await upload_resume(file=file, job_description=job_description, job_role=job_role, db=db)

@app.post("/api/v1/candidates/upload", tags=["candidates"])
async def upload_resume_candidates(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    job_role: str = Form("Unassigned"),
    db = Depends(get_db)
):
    """Candidates upload endpoint"""
    logger.info(f"Candidates upload request received: {file.filename}")
    return await upload_resume(file=file, job_description=job_description, job_role=job_role, db=db)

# Enhanced health check endpoint
@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "API Online",
        "version": "1.2.0-enhanced",
        "service": "PIPPO Resume Analysis",
        "features": [
            "Resume Parsing (PDF, DOCX, TXT)",
            "AI Skill Extraction",
            "Job Matching",
            "Candidate Management"
        ]
    }

@app.get("/health", tags=["health"])
def detailed_health_check():
    try:
        # Test database connection
        from database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "timestamp": "2025-06-10T21:20:00Z"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}", exc_info=True)
    return HTTPException(
        status_code=500,
        detail="Internal server error occurred"
    )

# Add middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
