from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "LexiScan AI",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
