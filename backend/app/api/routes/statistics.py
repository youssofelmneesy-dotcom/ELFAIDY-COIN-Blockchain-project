"""
Elfaidy Coin - Statistics Routes
GET /api/statistics - Platform-wide statistics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.statistics_service import get_statistics

router = APIRouter(tags=["Statistics"])

@router.get("", response_model=schemas.StatisticsResponse)
def statistics(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Get platform-wide statistics."""
    stats = get_statistics(db)
    return schemas.StatisticsResponse(**stats)
